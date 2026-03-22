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
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchJson } from '@/lib/fetch-json';
import { PortfolioWithProjects } from '@/types/portfolio';
import { useAuth } from '@/lib/auth-context';
import { AuthHeaderActions } from '@/components/auth/AuthHeaderActions';
import { supabase } from '@/lib/supabase';

function FormContent() {
  const { currentStep, setCurrentStep, formData, updateFormData, updateSkills, updateProjects, updateExperiences } = useFormContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editUsername = searchParams.get('edit');
  const [activeEditUsername, setActiveEditUsername] = useState<string | null>(editUsername);
  const hydratedUsernameRef = useRef<string | null>(null);
  const autoHydratedRef = useRef(false);
  const { isLoggedIn, userEmail } = useAuth();

  useEffect(() => {
    const hydratePortfolio = async (targetUsername: string) => {
      if (!targetUsername || hydratedUsernameRef.current === targetUsername) {
        return;
      }

      setIsLoadingPortfolio(true);
      try {
        const portfolio = await fetchJson<PortfolioWithProjects>(`/api/portfolio/${targetUsername}`);
        const ownerEmail = (portfolio.email || '').toLowerCase();
        const loggedInEmail = (userEmail || '').toLowerCase();

        if (!isLoggedIn || !loggedInEmail) {
          toast.error('Please log in to continue.');
          router.push('/login');
          return;
        }

        if (ownerEmail !== loggedInEmail) {
          toast.error('You can only edit your own portfolio.');
          router.push(`/${targetUsername}`);
          return;
        }

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
          template: (portfolio as { template?: string }).template === 'pastel' ? 'professional' : portfolio.template,
          is_public: portfolio.is_public ?? true,
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
            label: project.label || '',
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
        hydratedUsernameRef.current = targetUsername;
        setActiveEditUsername(targetUsername);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to load portfolio for editing.');
      } finally {
        setIsLoadingPortfolio(false);
      }
    };

    const runHydration = async () => {
      if (editUsername) {
        setActiveEditUsername(editUsername);
        await hydratePortfolio(editUsername);
        return;
      }

      if (!isLoggedIn || !userEmail || autoHydratedRef.current) {
        return;
      }

      autoHydratedRef.current = true;
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;

        const mine = await fetchJson<{ success: boolean; portfolios?: Array<{ username?: string }> }>(
          '/api/my-portfolios',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const firstUsername = mine.portfolios?.[0]?.username;
        if (!firstUsername) return;

        await hydratePortfolio(firstUsername);
      } catch (error) {
        console.error('Auto-hydration failed:', error);
      }
    };

    void runHydration();
  }, [editUsername, isLoggedIn, router, setCurrentStep, updateFormData, updateProjects, updateSkills, updateExperiences, userEmail]);

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
    { component: StepTemplate, validate: () => {
      if (!activeEditUsername) {
        if (!formData.username || formData.username.length < 3) {
          return 'Please enter a username (at least 3 characters)';
        }
        const usernameRegex = /^[a-z0-9-]+$/;
        if (!usernameRegex.test(formData.username)) {
          return 'Username can only contain lowercase letters, numbers, and hyphens';
        }
      }
      return null;
    }},
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
    const isEditMode = Boolean(activeEditUsername);

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

      let profilePhotoUrl = formData.profile_photo_url;
      let resumeUrl = formData.resume_url;

      if (formData.profile_photo) {
        profilePhotoUrl = await uploadFile(formData.profile_photo, 'profile-photos');
      } else if (isEditMode && formData.profile_photo_url) {
        profilePhotoUrl = formData.profile_photo_url;
      }

      if (formData.resume) {
        resumeUrl = await uploadFile(formData.resume, 'resumes');
      } else if (isEditMode && formData.resume_url) {
        resumeUrl = formData.resume_url;
      }

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
            label: project.label || '',
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

      if (!activeEditUsername) {
        if (!formData.username || formData.username.length < 3) {
          throw new Error('Please enter a username (at least 3 characters) in the Template step');
        }
        const usernameRegex = /^[a-z0-9-]+$/;
        if (!usernameRegex.test(formData.username)) {
          throw new Error('Username can only contain lowercase letters, numbers, and hyphens');
        }
      }

      const username = activeEditUsername || formData.username;
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
        is_public: formData.is_public ?? true,
        experiences: experiencesData,
        projects: projectsWithUrls,
      };

      const data = activeEditUsername
        ? await fetchJson<{ success: boolean; portfolio?: { username?: string } }>(`/api/portfolio/${activeEditUsername}`, {
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
        const finalUsername = activeEditUsername || (data as { username: string }).username;
        toast.success(activeEditUsername ? 'Portfolio updated successfully!' : 'Portfolio created successfully!');
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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-10">
      {/* Form Section */}
      <div className="lg:col-span-7">
        <div
          className="p-6 md:p-8 border m-transition animate-fade-in"
          style={{
            backgroundColor: 'var(--m-bg-card)',
            borderColor: 'var(--m-border)',
            borderRadius: 'var(--m-radius-lg)',
            boxShadow: `0 8px 30px var(--m-shadow)`,
          }}
        >
          <FormProgress currentStep={currentStep} />

          {isLoadingPortfolio ? (
            <div className="py-16 text-center font-medium" style={{ color: 'var(--m-text-secondary)' }}>
              Loading portfolio for editing...
            </div>
          ) : (
            <CurrentStepComponent />
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                disabled={isSubmitting || isLoadingPortfolio}
                className="m-btn-outline flex items-center gap-2 px-5 py-2.5 disabled:opacity-50"
                style={{ borderRadius: 'var(--m-radius)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={isSubmitting || isLoadingPortfolio}
                className="m-btn-accent flex items-center gap-2 px-6 py-2.5 disabled:opacity-50"
                style={{ borderRadius: 'var(--m-radius)' }}
              >
                {currentStep === 4 ? 'Next: Choose Theme' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoadingPortfolio}
                className="m-btn-accent flex items-center gap-2 px-6 py-2.5 disabled:opacity-50"
                style={{ borderRadius: 'var(--m-radius)' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {activeEditUsername ? 'Update My Portfolio' : 'Generate My Portfolio'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="hidden lg:block lg:col-span-5">
        <LivePreview />
      </div>
      <div className="lg:hidden">
        <LivePreview />
      </div>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn, userEmail } = useAuth();
  const [myPortfolioUsername, setMyPortfolioUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!isLoggedIn) {
        setMyPortfolioUsername(null);
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) return;
        const result = await fetchJson<{ success: boolean; portfolios?: Array<{ username?: string }> }>(
          '/api/my-portfolios',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const username = result.portfolios?.[0]?.username || null;
        setMyPortfolioUsername(username);
      } catch {
        setMyPortfolioUsername(null);
      }
    };
    void fetchPortfolio();
  }, [isLoggedIn, userEmail]);

  const hasPortfolio = isLoggedIn && myPortfolioUsername;

  return (
    <div className="min-h-screen m-transition m-grain" style={{ backgroundColor: 'var(--m-bg)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 w-full backdrop-blur-md border-b m-transition"
        style={{
          backgroundColor: 'var(--m-bg-header)',
          borderColor: 'var(--m-border-header)',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center size-9 rounded-lg shadow-sm"
                style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
              >
                <Sparkles className="w-4 h-4" />
              </div>
              <h2
                className="text-xl font-extrabold tracking-tight"
                style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
              >
                portlyfolio.site
              </h2>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4">
              {hasPortfolio ? (
                <>
                  <Link
                    href={`/${myPortfolioUsername}`}
                    className="text-sm font-semibold transition-colors px-2 py-1"
                    style={{ color: 'var(--m-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
                  >
                    View
                  </Link>
                  <Link
                    href={`/?edit=${myPortfolioUsername}`}
                    className="text-sm font-semibold transition-colors px-2 py-1"
                    style={{ color: 'var(--m-text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
                  >
                    Edit
                  </Link>
                </>
              ) : (
                <Link
                  href="/"
                  className="text-sm font-semibold transition-colors px-2 py-1"
                  style={{ color: 'var(--m-text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
                >
                  Create
                </Link>
              )}
              <Link
                href="/explore"
                className="text-sm font-semibold transition-colors px-2 py-1"
                style={{ color: 'var(--m-text-secondary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
              >
                Explore
              </Link>
              <AuthHeaderActions />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16 relative overflow-hidden">
        {/* Aesthetic mode colored accent blocks */}
        <div className="absolute top-8 left-6 w-20 h-20 bg-[#FFD60A] rounded-sm opacity-10 rotate-12" />
        <div className="absolute top-32 right-10 w-16 h-16 bg-[#FF6B6B] rounded-sm opacity-10 -rotate-6" />
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-[#00E676] rounded-sm opacity-8 rotate-45" />
        <div className="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mx-auto mb-6 border"
            style={{
              backgroundColor: 'var(--m-bg-badge)',
              borderColor: 'var(--m-border)',
              color: 'var(--m-accent)',
              borderRadius: '0.25rem',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: 'var(--m-accent)' }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: 'var(--m-accent)' }}
              />
            </span>
            Free Portfolio Generator
          </div>
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-black leading-none tracking-tight mb-4"
            style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
          >
            YOUR PORTFOLIO.{' '}
            <span className="m-gradient-text">YOUR STORY.</span>
          </h1>
          <p
            className="text-lg max-w-2xl mx-auto font-medium leading-relaxed mb-8"
            style={{ color: 'var(--m-text-secondary)' }}
          >
            Fill in your details. Pick a theme. Share your link. The professional way to showcase your projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {hasPortfolio ? (
              <>
                <Link
                  href={`/${myPortfolioUsername}`}
                  className="m-btn-accent px-8 py-3.5 font-bold text-base text-center"
                  style={{ borderRadius: 'var(--m-radius)' }}
                >
                  View Portfolio
                </Link>
                <Link
                  href={`/?edit=${myPortfolioUsername}`}
                  className="m-btn-outline px-8 py-3.5 font-bold text-base text-center"
                  style={{ borderRadius: 'var(--m-radius)' }}
                >
                  Edit Portfolio
                </Link>
              </>
            ) : (
              <>
                <a
                  href="#form"
                  className="m-btn-accent px-8 py-3.5 font-bold text-base text-center"
                  style={{ borderRadius: 'var(--m-radius)' }}
                >
                  Create Now
                </a>
                <Link
                  href="/explore"
                  className="m-btn-outline px-8 py-3.5 font-bold text-base text-center"
                  style={{ borderRadius: 'var(--m-radius)' }}
                >
                  See What Others Are Building
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Form Section */}
        <div id="form">
          {isLoggedIn ? (
            <FormProvider>
              <FormContent />
            </FormProvider>
          ) : (
            <div
              className="max-w-2xl mx-auto p-8 md:p-10 border text-center m-transition"
              style={{
                backgroundColor: 'var(--m-bg-card)',
                borderColor: 'var(--m-border)',
                borderRadius: 'var(--m-radius-lg)',
                boxShadow: `0 8px 30px var(--m-shadow)`,
              }}
            >
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
              >
                Login Required
              </h3>
              <p className="mb-6" style={{ color: 'var(--m-text-secondary)' }}>
                Please log in to create and publish your portfolio.
              </p>
              <Link
                href="/login?returnTo=%2F"
                className="m-btn-accent inline-flex items-center justify-center px-8 py-3"
                style={{ borderRadius: 'var(--m-radius)' }}
              >
                Log In to Continue
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-10 m-transition"
        style={{
          backgroundColor: 'var(--m-bg-footer)',
          borderColor: 'var(--m-border)',
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center size-7 rounded-md"
              style={{ backgroundColor: 'var(--m-accent)', color: 'var(--m-bg)' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--m-text-heading)', fontFamily: 'var(--m-font-heading)' }}
            >
              portlyfolio.site
            </h2>
          </div>
          <div className="flex gap-6 text-sm font-semibold">
            <Link
              href="/explore"
              className="transition-colors"
              style={{ color: 'var(--m-text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--m-accent)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--m-text-secondary)'}
            >
              Explore
            </Link>
          </div>
          <div className="text-sm font-medium" style={{ color: 'var(--m-text-muted)' }}>
            &copy; {new Date().getFullYear()} portlyfolio.site. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
