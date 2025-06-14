
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wtzvuiltqqajgyzzdcal.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0enZ1aWx0cXFhamd5enpkY2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxMzg4NjYsImV4cCI6MjA0MTcxNDg2Nn0.R0gjrIQ4dRvauiKuuOIALd3HtsjOLC3yAk6WyN1teys'
);

export default supabase;
