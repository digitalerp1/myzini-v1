
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might have better error handling or a fallback.
  // For this context, we'll proceed assuming it's set in the environment.
  console.warn("Gemini API key not found. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const schema = `
-- Database Schema for a School Management System

CREATE TABLE public.owner (
  uid uuid NOT NULL PRIMARY KEY,
  school_name text NOT NULL,
  principal_name text,
  mobile_number text NOT NULL,
  school_image_url text,
  register_date timestamp with time zone NOT NULL DEFAULT now(),
  address text,
  website text,
  school_code text UNIQUE
);

CREATE TABLE public.staff (
  id bigint GENERATED ALWAYS AS IDENTITY,
  uid uuid NOT NULL,
  staff_id text UNIQUE,
  name text,
  mobile text,
  gmail text,
  father_name text,
  mother_name text,
  address text,
  password text,
  highest_qualification text,
  joining_date date,
  photo_url text,
  salary_amount numeric,
  total_paid numeric DEFAULT 0,
  total_dues numeric DEFAULT 0,
  is_active boolean DEFAULT true,
  -- monthly payment tracking
  january date, february date, march date, april date, may date, june date, july date, august date, september date, october date, november date, december date,
  PRIMARY KEY (id, uid)
);

CREATE TABLE public.students (
  id bigint GENERATED ALWAYS AS IDENTITY,
  uid uuid NOT NULL,
  roll_number text,
  name text,
  mobile text,
  gmail text,
  password text,
  father_name text,
  mother_name text,
  class text,
  address text,
  photo_url text,
  aadhar text,
  gender text,
  date_of_birth date,
  registration_date timestamp with time zone DEFAULT now(),
  caste text,
  blood_group text,
  previous_school_name text,
  -- monthly fee tracking
  january text DEFAULT 'undefined', february text DEFAULT 'undefined', march text DEFAULT 'undefined', april text DEFAULT 'undefined', may text DEFAULT 'undefined', june text DEFAULT 'undefined', july text DEFAULT 'undefined', august text DEFAULT 'undefined', september text DEFAULT 'undefined', october text DEFAULT 'undefined', november text DEFAULT 'undefined', december text DEFAULT 'undefined',
  previous_dues numeric,
  PRIMARY KEY (id, uid)
);

CREATE TABLE public.classes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid uuid NOT NULL,
  class_name text NOT NULL,
  staff_id text, -- staff_id of class teacher
  school_fees numeric
);

CREATE TABLE public.subjects (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid uuid NOT NULL,
  subject_name text NOT NULL
);

CREATE TABLE public.assign_class (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid uuid NOT NULL,
  class_id bigint NOT NULL,
  subject_id bigint NOT NULL,
  staff_id text,
  incoming_time time without time zone,
  outgoing_time time without time zone
);

CREATE TABLE public.attendance (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid uuid NOT NULL,
  class_id bigint NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  present text, -- Can be a JSON array of student IDs
  absent text   -- Can be a JSON array of student IDs
);

CREATE TABLE public.expenses (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid uuid NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  notes text,
  amount numeric NOT NULL
);

CREATE TABLE public.fees_types (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid uuid NOT NULL,
  fees_name text NOT NULL,
  amount numeric NOT NULL,
  frequency text -- e.g., 'monthly', 'yearly', 'one-time'
);

CREATE TABLE public.salary_records (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid uuid NOT NULL,
  staff_id text NOT NULL,
  date_time timestamp with time zone NOT NULL DEFAULT now(),
  amount numeric NOT NULL,
  notes text
);
`;

export const getInsightsFromGemini = async (query: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve("Error: Gemini API key is not configured. Please set the API_KEY environment variable.");
  }

  try {
    const prompt = `
      You are an expert school data analyst. Your task is to interpret a user's natural language query and provide a clear, concise, and helpful summary based on the provided database schema. Do not generate SQL. Instead, describe the data that would be retrieved and present it in a user-friendly markdown format.

      Here is the database schema:
      ${schema}

      ---
      User Query: "${query}"
      ---

      Based on the schema, please provide a summary of the requested information. For example, if the user asks for "all students in class 10", you could respond with a markdown list of what those results would contain, like student names and roll numbers. If the query is complex, break down how you would find the information step-by-step.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `An error occurred while communicating with the AI assistant: ${error.message}`;
    }
    return "An unknown error occurred while communicating with the AI assistant.";
  }
};
