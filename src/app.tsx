import { AppHeader } from '@/layout/app-header';
import { AppFooter } from '@/layout/app-footer';
import { Workspace } from '@/layout/workspace';
import { TooltipProvider } from '@/shadcn/tooltip';

export const App = () => {

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full flex-col bg-muted">
        <AppHeader />
        <Workspace />
        <AppFooter />
      </div>
    </TooltipProvider>
  )

}