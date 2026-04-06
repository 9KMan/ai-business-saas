import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/types/database';

export const defaultLocale: SupportedLocale = 'en';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as SupportedLocale) || defaultLocale;

  return {
    locale: SUPPORTED_LOCALES.includes(locale) ? locale : defaultLocale,
    messages: {
      // Using simple inline translations since we're MVP
      // In production, load from /messages/{locale}.json
      common: {
        appName: 'AI Business SaaS',
        dashboard: 'Dashboard',
        tasks: 'Tasks',
        settings: 'Settings',
        logout: 'Logout',
        login: 'Login',
        signup: 'Sign Up',
        email: 'Email',
        password: 'Password',
        submit: 'Submit',
        cancel: 'Cancel',
        delete: 'Delete',
        loading: 'Loading...',
      },
      landing: {
        hero: 'AI-Powered Business Management',
        subtitle: 'Streamline your business with intelligent task management powered by AI',
        getStarted: 'Get Started',
        feature1Title: 'Natural Language Tasks',
        feature1Desc: 'Describe tasks in plain English and let AI do the structuring',
        feature2Title: 'Multi-language Support',
        feature2Desc: 'Work in English, Hebrew, Spanish, French, or German',
        feature3Title: 'Smart Prioritization',
        feature3Desc: 'AI helps you focus on what matters most',
      },
      dashboard: {
        welcome: 'Welcome back',
        totalTasks: 'Total Tasks',
        pending: 'Pending',
        completed: 'Completed',
        highPriority: 'High Priority',
        recentTasks: 'Recent Tasks',
        addTask: 'Add Task',
        noTasks: 'No tasks yet. Create your first one!',
      },
      tasks: {
        title: 'Tasks',
        new: 'New Task',
        createTask: 'Create Task',
        describeTask: 'Describe your task naturally',
        placeholder: 'e.g., Create 50 units of Product X ship by Dec 15',
        creating: 'Creating task...',
        statusPending: 'Pending',
        statusInProgress: 'In Progress',
        statusCompleted: 'Completed',
        priorityLow: 'Low',
        priorityMedium: 'Medium',
        priorityHigh: 'High',
        deleteConfirm: 'Delete this task?',
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        selectLanguage: 'Select language',
        profile: 'Profile',
        save: 'Save Changes',
        saved: 'Settings saved!',
      },
      auth: {
        loginTitle: 'Welcome Back',
        signupTitle: 'Create Account',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        signInWithGoogle: 'Continue with Google',
        orContinueWithEmail: 'Or continue with email',
      },
    },
  };
});
