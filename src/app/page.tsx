import { Header } from '@/components/app/header';
import { MainPage } from '@/components/app/main-page';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 md:p-8">
        <MainPage />
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        PropScrapeAI &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
