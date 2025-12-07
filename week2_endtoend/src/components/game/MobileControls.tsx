import { Button } from '@/components/ui/button';
import { Direction } from '@/lib/gameLogic';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileControlsProps {
  onDirection: (direction: Direction) => void;
  disabled?: boolean;
}

export function MobileControls({ onDirection, disabled }: MobileControlsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-48 mx-auto mt-4 md:hidden">
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('UP')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ChevronUp className="h-8 w-8" />
      </Button>
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('LEFT')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('DOWN')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ChevronDown className="h-8 w-8" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('RIGHT')}
        disabled={disabled}
        className="h-14 w-14"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </div>
  );
}
