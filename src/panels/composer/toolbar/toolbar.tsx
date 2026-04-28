import { Button } from '@/shadcn/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shadcn/tooltip';
import { useComposerState } from '../composer-state';
import { Separator } from '@/shadcn/separator';
import { 
  ArrowDownNarrowWide, 
  ArrowUpNarrowWide, 
  LockKeyhole, 
  Maximize, 
  Redo2, 
  Trash2, 
  Undo2 
} from 'lucide-react';

interface ToolbarProps {

  onSave(): void;

}

export const Toolbar = (props: ToolbarProps) => {

  const selectedId = useComposerState(state => state.selectedId);

  const canvasWidth = useComposerState(state => state.canvasWidth);
  const canvasHeight = useComposerState(state => state.canvasHeight);

  return (
    <div className="absolute bottom-4 w-full flex justify-center z-50">
      <div className="bg-white flex items-center gap-1 border min-w-40 rounded p-1 shadow-xs">
        <div className="text-[11px] font-mono text-muted-foreground py-1 px-2">
          {canvasWidth.toLocaleString()} x {canvasHeight.toLocaleString()}
        </div>

        <Separator orientation="vertical" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                disabled={!selectedId}
                variant="ghost">
                <Trash2 className="size-4" />
              </Button>
            }/>
          <TooltipContent>
            Delete selected image
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost">
                <ArrowUpNarrowWide className="size-4" />
              </Button>
            } />
          <TooltipContent>
            Move up
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost">
                <ArrowDownNarrowWide className="size-4" />
              </Button>
            } />
          <TooltipContent>
            Move down
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                disabled={!selectedId}
                variant="ghost">
                <Maximize className="size-4" />
              </Button>
            } />
          <TooltipContent>
            Fill canvas dimensions
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost">
                <LockKeyhole className="size-4" />
              </Button>
            } />
          <TooltipContent>
            Lock shape
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost">
                <Undo2 className="size-4" />
              </Button>
            } />
          <TooltipContent>
            Undo
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost">
                <Redo2 className="size-4" />
              </Button>
            } />
          <TooltipContent>
            Redo
          </TooltipContent>
        </Tooltip>

        <Button
          className="ml-2"
          onClick={props.onSave}>
          Save
        </Button>
      </div>
    </div>
  )

}