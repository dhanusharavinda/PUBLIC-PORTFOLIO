'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FormData, TemplateType, AvailabilityStatus, Skill, FormProject, FormExperience } from '@/types/portfolio';

interface FormContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: FormData;
  updateFormData: (data: Partial<FormData>) => void;
  updateProjects: (projects: FormProject[]) => void;
  updateSkills: (skills: Skill[]) => void;
  updateExperiences: (experiences: FormExperience[]) => void;
  addProject: () => void;
  removeProject: (id: string) => void;
  updateProject: (id: string, data: Partial<FormProject>) => void;
  reorderProjects: (startIndex: number, endIndex: number) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, data: Partial<FormExperience>) => void;
  reorderExperiences: (startIndex: number, endIndex: number) => void;
}

const defaultFormData: FormData = {
  full_name: '',
  tagline: '',
  job_title: '',
  location: '',
  bio: '',
  email: '',
  profile_photo: null,
  profile_photo_url: '',
  linkedin_url: '',
  github_username: '',
  resume: null,
  resume_url: '',
  availability_status: 'open_fulltime',
  open_to_work: true,
  skills: [],
  experiences: [],
  projects: [],
  template: 'minimal',
  is_public: true,
};

const FormContext = createContext<FormContextType | undefined>(undefined);

export function FormProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const updateProjects = (projects: FormProject[]) => {
    setFormData((prev) => ({ ...prev, projects }));
  };

  const updateSkills = (skills: Skill[]) => {
    setFormData((prev) => ({ ...prev, skills }));
  };

  const updateExperiences = (experiences: FormExperience[]) => {
    setFormData((prev) => ({ ...prev, experiences }));
  };

  const addProject = () => {
    if (formData.projects.length >= 10) return;

    const newProject: FormProject = {
      id: crypto.randomUUID(),
      name: '',
      cover_image: null,
      cover_image_url: '',
      carousel_images: [null, null, null],
      carousel_image_urls: [],
      description: '',
      tech_stack: [],
      github_url: '',
      demo_url: '',
      is_featured: formData.projects.length === 0,
    };

    setFormData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const removeProject = (id: string) => {
    setFormData((prev) => {
      const filtered = prev.projects.filter((p) => p.id !== id);
      // If we removed the featured project, make the first one featured
      if (filtered.length > 0 && !filtered.some((p) => p.is_featured)) {
        filtered[0].is_featured = true;
      }
      return { ...prev, projects: filtered };
    });
  };

  const updateProject = (id: string, data: Partial<FormProject>) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...data } : p
      ),
    }));
  };

  const reorderProjects = (startIndex: number, endIndex: number) => {
    setFormData((prev) => {
      const projects = [...prev.projects];
      const [removed] = projects.splice(startIndex, 1);
      projects.splice(endIndex, 0, removed);
      return { ...prev, projects };
    });
  };

  const addExperience = () => {
    if (formData.experiences.length >= 10) return;

    const newExperience: FormExperience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
    };

    setFormData((prev) => ({
      ...prev,
      experiences: [...prev.experiences, newExperience],
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id),
    }));
  };

  const updateExperience = (id: string, data: Partial<FormExperience>) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    }));
  };

  const reorderExperiences = (startIndex: number, endIndex: number) => {
    setFormData((prev) => {
      const experiences = [...prev.experiences];
      const [removed] = experiences.splice(startIndex, 1);
      experiences.splice(endIndex, 0, removed);
      return { ...prev, experiences };
    });
  };

  return (
    <FormContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        formData,
        updateFormData,
        updateProjects,
        updateSkills,
        updateExperiences,
        addProject,
        removeProject,
        updateProject,
        reorderProjects,
        addExperience,
        removeExperience,
        updateExperience,
        reorderExperiences,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
