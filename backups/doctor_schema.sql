CREATE TABLE IF NOT EXISTS "Doctor" (
  id text NOT NULL, 
  name text NOT NULL, 
  fee double precision NOT NULL, 
  speciality text NOT NULL, 
  createdAt timestamp without time zone NOT NULL, 
  updatedAt timestamp without time zone NOT NULL, 
  image text, 
  isActive boolean NOT NULL
); 