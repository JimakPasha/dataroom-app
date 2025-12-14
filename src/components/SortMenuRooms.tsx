import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setSortBy, setSortDirection } from '@/store/settingsSlice';
import { ArrowUpDown, Check } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from '@/lib/utils';

export const SortMenuRooms = () => {
  const dispatch = useAppDispatch();
  const { sortBy, sortDirection } = useAppSelector((state) => state.settings);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Sort and organize">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => dispatch(setSortBy('name'))}
          className={cn(sortBy === 'name' && 'bg-accent')}
        >
          <Check className={cn('h-4 w-4 mr-2', sortBy !== 'name' && 'invisible')} />
          Name
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => dispatch(setSortBy('dateModified'))}
          className={cn(sortBy === 'dateModified' && 'bg-accent')}
        >
          <Check className={cn('h-4 w-4 mr-2', sortBy !== 'dateModified' && 'invisible')} />
          Date Modified
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort direction</DropdownMenuLabel>
        <DropdownMenuItem 
          onClick={() => dispatch(setSortDirection('asc'))}
          className={cn(sortDirection === 'asc' && 'bg-accent')}
        >
          <Check className={cn('h-4 w-4 mr-2', sortDirection !== 'asc' && 'invisible')} />
          Ascending
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => dispatch(setSortDirection('desc'))}
          className={cn(sortDirection === 'desc' && 'bg-accent')}
        >
          <Check className={cn('h-4 w-4 mr-2', sortDirection !== 'desc' && 'invisible')} />
          Descending
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

