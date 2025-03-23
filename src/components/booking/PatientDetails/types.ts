import { z } from 'zod';
import { patientSchema } from './schema';

export type PatientFormData = z.infer<typeof patientSchema>; 