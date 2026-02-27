'use client';

import { FormProvider, useFormContext } from '@/components/form/FormContext';
import { FormProgress } from '@/components/form/FormProgress';
import { StepPersonal } from '@/components/form/StepPersonal';
import { StepSkills } from '@/components/form/StepSkills';
import { StepExperience } from '@/components/form/StepExperience';
import { StepProjects } from '@/components/form/StepProjects';
import { StepTemplate } from '@/components/form/StepTemplate';
import { LivePreview } from '@/components/form/LivePreview';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { slugify } from '@/lib/slugify';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchJson } from '@/lib/fetch-json';
import { PortfolioWithProjects } from '@/types/portfolio';
import { AuthControls } from '@/components/auth/AuthControls';

function FormContent() {
  const { currentStep, setCurrentStep, formData, updateFormData, updateSkills, updateProjects, updateExperiences } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editUsername = searchParams.get('edit');
  const hydratedUsernameRef = useRef<string | null>(null);

  useEffect(() => {
    const hydratePortfolio = async () => {
      if (!editUsername || hydratedUsernameRef.current === editUsername) {
        return;
      }

      setIsLoadingPortfolio(true);
      try {
        const portfolio = await fetchJson<PortfolioWithProjects>(`/api/portfolio/${editUsername}`);

        updateFormData({
          full_name: portfolio.full_name || '',
          tagline: portfolio.tagline || '',
          job_title: portfolio.job_title || '',
          location: portfolio.location || '',
          bio: portfolio.bio || '',
          email: portfolio.email || '',
          profile_photo_url: portfolio.profile_photo_url || '',
          linkedin_url: portfolio.linkedin_url || '',
          github_username: portfolio.github_username || '',
          resume_url: portfolio.resume_url || '',
          availability_status: portfolio.availability_status,
          open_to_work: portfolio.open_to_work,
          template: portfolio.template,
        });

        updateSkills(Array.isArray(portfolio.skills) ? portfolio.skills : []);
        updateExperiences(
          (portfolio.experiences || []).map((exp) => ({
            id: exp.id || crypto.randomUUID(),
            company: exp.company || '',
            role: exp.role || '',
            location: exp.location || '',
            start_date: exp.start_date || '',
            end_date: exp.end_date || '',
            is_current: Boolean(exp.is_current),
            description: exp.description || '',
          }))
        );
        updateProjects(
          (portfolio.projects || []).map((project) => ({
            id: project.id || crypto.randomUUID(),
            name: project.name || '',
            cover_image: null,
            cover_image_url: project.cover_image_url || '',
            carousel_images: [null, null, null],
            carousel_image_urls: Array.isArray(project.carousel_images) ? project.carousel_images : [],
            description: project.description || '',
            tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
            github_url: project.github_url || '',
            demo_url: project.demo_url || '',
            is_featured: Boolean(project.is_featured),
          }))
        );
        setCurrentStep(1);
        hydratedUsernameRef.current = editUsername;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load portfolio for editing.');
      } finally {
        setIsLoadingPortfolio(false);
      }
    };

    void hydratePortfolio();
  }, [editUsername, setCurrentStep, updateFormData, updateProjects, updateSkills]);

  const steps = [
    { component: StepPersonal, validate: () => {
      if (!formData.full_name.trim()) return 'Full name is required';
      if (!formData.job_title.trim()) return 'Job title is required';
      if (!formData.bio.trim()) return 'Bio is required';
      if (!formData.email.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Invalid email format';
      return null;
    }},
    { component: StepSkills, validate: () => null },
    { component: StepExperience, validate: () => null },
    { component: StepProjects, validate: () => null },
    { component: StepTemplate, validate: () => null },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleNext = () => {
    const error = steps[currentStep - 1].validate();
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const isEditMode = Boolean(editUsername);

    try {
      const bioWordCount = formData.bio.trim().split(/\s+/).filter(Boolean).length;
      if (bioWordCount > 400) {
        throw new Error('Bio must be 400 words or less.');
      }

      const uploadFile = async (file: File, bucket: 'profile-photos' | 'project-images' | 'resumes') => {
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object provided for upload.');
    }
    if (file.size === 0) {
      throw new Error('Cannot upload empty file.');
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('bucket', bucket);
    uploadFormData.append('path', `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`);

    try {
      const data = await fetchJson<{ success: boolean; url?: string }>('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!data.url) {
        throw new Error('Upload succeeded but file URL was not returned.');
      }

      return data.url;
    } catch (err) {
      console.error('Upload error details:', err);
      throw err;
    }
  };

      // Upload files first
      let profilePhotoUrl = formData.profile_photo_url;
      let resumeUrl = formData.resume_url;

      // Upload profile photo (or use existing URL if editing and not changed)
      if (formData.profile_photo) {
        profilePhotoUrl = await uploadFile(formData.profile_photo, 'profile-photos');
      } else if (isEditMode && formData.profile_photo_url) {
        profilePhotoUrl = formData.profile_photo_url;
      }

      // Upload resume (or use existing URL if editing and not changed)
      if (formData.resume) {
        resumeUrl = await uploadFile(formData.resume, 'resumes');
      } else if (isEditMode && formData.resume_url) {
        resumeUrl = formData.resume_url;
      }

      // Upload project images
      const activeProjects = formData.projects.filter(
        (project) =>
          project.name.trim() ||
          project.description.trim() ||
          Boolean(project.cover_image) ||
          Boolean(project.cover_image_url) ||
          project.tech_stack.length > 0 ||
          Boolean(project.github_url.trim()) ||
          Boolean(project.demo_url.trim())
      );

      const projectsWithUrls = await Promise.all(
        activeProjects.map(async (project) => {
          if (!project.name.trim()) {
            throw new Error('Each project must have a name.');
          }

          let coverImageUrl = project.cover_image_url;
          const carouselUrls: string[] = [];

          if (project.cover_image) {
            coverImageUrl = await uploadFile(project.cover_image, 'project-images');
          }

          for (const img of project.carousel_images) {
            if (img) {
              const imageUrl = await uploadFile(img, 'project-images');
              carouselUrls.push(imageUrl);
            }
          }

          return {
            name: project.name,
            cover_image_url: coverImageUrl,
            carousel_images: carouselUrls,
            description: project.description,
            tech_stack: project.tech_stack,
            github_url: project.github_url,
            demo_url: project.demo_url,
            is_featured: project.is_featured,
            order_index: activeProjects.indexOf(project),
          };
        })
      );

      // Prepare experiences data
      const activeExperiences = formData.experiences.filter(
        (exp) =>
          exp.company.trim() ||
          exp.role.trim() ||
          exp.description.trim()
      );

      const experiencesData = activeExperiences.map((exp, index) => ({
        company: exp.company,
        role: exp.role,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.is_current ? '' : exp.end_date,
        is_current: exp.is_current,
        description: exp.description,
        order_index: index,
      }));

      // Create portfolio
      const username = editUsername || slugify(formData.full_name);
      const portfolioData = {
        username,
        full_name: formData.full_name,
        tagline: formData.tagline,
        job_title: formData.job_title,
        location: formData.location,
        bio: formData.bio,
        email: formData.email,
        profile_photo_url: profilePhotoUrl,
        linkedin_url: formData.linkedin_url,
        github_username: formData.github_username,
        resume_url: resumeUrl,
        availability_status: formData.availability_status,
        open_to_work: formData.open_to_work,
        skills: formData.skills,
        template: formData.template,
        experiences: experiencesData,
        projects: projectsWithUrls,
      };

      const data = editUsername
        ? await fetchJson<{ success: boolean; portfolio?: { username?: string } }>(`/api/portfolio/${editUsername}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(portfolioData),
          })
        : await fetchJson<{ success: boolean; username: string }>('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(portfolioData),
          });

      if (data.success) {
        const finalUsername = editUsername || (data as { username: string }).username;
        toast.success(editUsername ? 'Portfolio updated successfully!' : 'Portfolio created successfully!');
        router.push(`/success?username=${finalUsername}`);
      } else {
        toast.error('Failed to create portfolio');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
      {/* Form Section */}
      <div className="lg:col-span-7">
        <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50">
          <FormProgress currentStep={currentStep} />

          {isLoadingPortfolio ? (
            <div className="py-16 text-center text-stone-500 font-medium">Loading portfolio for editing...</div>
          ) : (
            <CurrentStepComponent />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting || isLoadingPortfolio}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={isSubmitting || isLoadingPortfolio}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoadingPortfolio}
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {editUsername ? 'Update My Portfolio' : 'Generate My Portfolio'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Section - Desktop Only */}
      <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
        <LivePreview />
      </div>

      {/* Live Preview Section - Mobile/Tablet */}
      <div className="lg:hidden">
        <LivePreview />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FFF9F5] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-md border-b border-white/40">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex h-20 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 bg-orange-500 rounded-xl text-white shadow-md shadow-orange-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-800">
                buildfol.io
              </h2>
            </div>
            <nav className="flex items-center gap-3 sm:gap-8">
              <Link href="/" className="text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors">
                Create
              </Link>
              <Link href="/explore" className="text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors">
                Explore
              </Link>
              <AuthControls />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-10 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-16">
          <div className="w-full lg:w-1/2 flex flex-col gap-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white text-orange-500 text-xs font-bold uppercase tracking-wider w-fit mx-auto lg:mx-0 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Free Portfolio Generator
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight text-stone-800">
              Your Portfolio. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-purple-500">
                Your Story.
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-500 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
              Fill in your details. Pick a theme. Share your link. The professional way to showcase your data projects with style.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="#form"
                className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-orange-500/20 hover:bg-orange-600 transition-all transform hover:-translate-y-1 text-center"
              >
                Create Now
              </a>
              <Link
                href="/explore"
                className="bg-white text-stone-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-stone-50 border border-stone-200 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 text-center"
              >
                View Examples
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl shadow-orange-500/10 rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
              <div className="h-[400px] w-full bg-gradient-to-br from-purple-100 via-white to-orange-100 p-8">
                <div className="w-full h-full rounded-3xl bg-white/60 backdrop-blur-md border border-white/60 p-6 shadow-xl">
                  <div className="flex gap-3 mb-6">
                    <div className="size-4 rounded-full bg-red-300"></div>
                    <div className="size-4 rounded-full bg-amber-300"></div>
                    <div className="size-4 rounded-full bg-emerald-300"></div>
                  </div>
                  <div className="space-y-5">
                    <div className="h-10 w-1/3 bg-white/60 rounded-xl shadow-sm"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-28 bg-orange-200/50 rounded-2xl border border-white/50"></div>
                      <div className="h-28 bg-purple-200/50 rounded-2xl border border-white/50"></div>
                      <div className="h-28 bg-green-200/50 rounded-2xl border border-white/50"></div>
                    </div>
                    <div className="h-40 bg-stone-200/50 rounded-2xl border border-white/50"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div id="form">
          <FormProvider>
            <FormContent />
          </FormProvider>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100 py-12">
        <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-8 bg-orange-500 rounded-lg text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-stone-800">buildfol.io</h2>
          </div>
          <div className="flex gap-8 text-sm font-semibold text-stone-500">
            <Link href="/explore" className="hover:text-orange-500 transition-colors">Explore</Link>
          </div>
          <div className="text-sm text-stone-500 font-medium">
            &copy; {new Date().getFullYear()} buildfol.io. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
