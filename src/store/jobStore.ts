import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { CargoJob, EditHistoryItem } from '../types/job';
import { generateId } from '../lib/utils';

interface JobState {
  jobs: CargoJob[];
  editHistory: EditHistoryItem[];
  selectedJob: CargoJob | null;
  isLoading: boolean;
  error: string | null;
  fetchJobs: () => Promise<void>;
  addJob: (job: Omit<CargoJob, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
  updateJob: (job: CargoJob) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  selectJob: (job: CargoJob | null) => void;
  fetchJobHistory: (jobId: string) => Promise<void>;
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: [],
      editHistory: [],
      selectedJob: null,
      isLoading: false,
      error: null,
      
      fetchJobs: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // First check if we have a valid session
          const { data: sessionData } = await supabase.auth.getSession();
          if (!sessionData?.session?.access_token) {
            set({ 
              jobs: [],
              isLoading: false,
              error: null // Don't set error for expected auth state
            });
            return;
          }
          
          // Then verify we have a valid user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError || !user) {
            throw new Error('Authentication required');
          }
          
          const { data, error } = await supabase
            .from('cargo_jobs')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          set({ jobs: data as CargoJob[], isLoading: false });
        } catch (error: any) {
          console.error('Error fetching jobs:', error);
          set({ 
            error: error.message === 'Authentication required' 
              ? null // Don't show error for auth state
              : 'Failed to load jobs. Using cached data.',
            isLoading: false 
          });
        }
      },
      
      addJob: async (jobData) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Authentication required');
          
          const newJob = {
            ...jobData,
            actual_delivery_date: jobData.actual_delivery_date || null,
            created_by: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data, error } = await supabase
            .from('cargo_jobs')
            .insert([newJob])
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({ 
            jobs: [data as CargoJob, ...state.jobs],
            isLoading: false 
          }));
        } catch (error: any) {
          console.error('Error adding job:', error);
          set({ 
            error: 'Failed to save job. Please try again.',
            isLoading: false 
          });
          throw error;
        }
      },
      
      updateJob: async (updatedJob) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Authentication required');
          
          const currentJob = get().jobs.find(job => job.id === updatedJob.id);
          if (!currentJob) throw new Error('Job not found');
          
          // Remove client-side only fields and ensure proper data types
          const sanitizedJob = {
            ...updatedJob,
            // Remove any undefined or client-side fields
            id: updatedJob.id,
            shipper_name: updatedJob.shipper_name,
            payment_status: updatedJob.payment_status,
            delivery_status: updatedJob.delivery_status,
            pickup_location: updatedJob.pickup_location,
            dropoff_location: updatedJob.dropoff_location,
            intermediate_stops: updatedJob.intermediate_stops || [],
            pickup_date: updatedJob.pickup_date,
            estimated_delivery_date: updatedJob.estimated_delivery_date,
            actual_delivery_date: updatedJob.actual_delivery_date || null,
            agreed_price: Number(updatedJob.agreed_price),
            notes: updatedJob.notes || null,
            receipt_url: updatedJob.receipt_url || null,
            updated_at: new Date().toISOString()
          };
          
          // Remove fields that shouldn't be updated
          delete sanitizedJob.created_at;
          delete sanitizedJob.created_by;
          
          const historyItems: Omit<EditHistoryItem, 'id'>[] = [];
          Object.keys(sanitizedJob).forEach(key => {
            const field = key as keyof CargoJob;
            if (
              field !== 'id' && 
              field !== 'created_at' && 
              field !== 'created_by' &&
              field !== 'updated_at' &&
              JSON.stringify(currentJob[field]) !== JSON.stringify(sanitizedJob[field])
            ) {
              historyItems.push({
                job_id: sanitizedJob.id,
                field,
                old_value: currentJob[field],
                new_value: sanitizedJob[field],
                changed_at: new Date().toISOString(),
                changed_by: user.id
              });
            }
          });
          
          const { error: updateError } = await supabase
            .from('cargo_jobs')
            .update(sanitizedJob)
            .eq('id', updatedJob.id);
            
          if (updateError) throw updateError;
          
          if (historyItems.length > 0) {
            const { error: historyError } = await supabase
              .from('job_history')
              .insert(historyItems);
              
            if (historyError) {
              console.warn('Failed to save edit history:', historyError);
              // Don't fail the entire update if history fails
            }
          }
          
          set(state => ({
            jobs: state.jobs.map(job => 
              job.id === updatedJob.id ? sanitizedJob : job
            ),
            selectedJob: null, // Clear selection after successful update
            isLoading: false
          }));
        } catch (error: any) {
          console.error('Error updating job:', error);
          set({ 
            error: 'Failed to update job. Please try again.',
            isLoading: false 
          });
          throw error;
        }
      },
      
      deleteJob: async (id) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Authentication required');
          
          const { error } = await supabase
            .from('cargo_jobs')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          set(state => ({
            jobs: state.jobs.filter(job => job.id !== id),
            selectedJob: state.selectedJob?.id === id ? null : state.selectedJob,
            isLoading: false
          }));
        } catch (error: any) {
          console.error('Error deleting job:', error);
          set({ 
            error: 'Failed to delete job. Please try again.',
            isLoading: false 
          });
          throw error;
        }
      },
      
      selectJob: (job) => {
        set({ selectedJob: job });
      },
      
      fetchJobHistory: async (jobId) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Authentication required');
          
          const { data, error } = await supabase
            .from('job_history')
            .select('*')
            .eq('job_id', jobId)
            .order('changed_at', { ascending: false });
            
          if (error) throw error;
          
          set({ 
            editHistory: data as EditHistoryItem[],
            isLoading: false 
          });
        } catch (error: any) {
          console.error('Error fetching job history:', error);
          set({ 
            error: 'Failed to load job history.',
            isLoading: false 
          });
        }
      }
    }),
    {
      name: 'cargo-jobs-storage',
      skipHydration: true,
    }
  )
);