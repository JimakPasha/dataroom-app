import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { setCurrentFolder } from '@/store/folderSlice';
import { Folder, ChevronRight, ChevronDown, Database } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';


interface FolderTreeItemProps {
  folderId: string;
  level?: number;
  isLast?: boolean;
  parentPath?: boolean[];
}

const FolderTreeItem = ({ folderId, level = 0, isLast = false, parentPath = [] }: FolderTreeItemProps) => {
  const dispatch = useAppDispatch();
  const { folders, currentFolderId } = useAppSelector((state) => state.folder);
  const folder = folders.find((f) => f.id === folderId);
  const [expanded, setExpanded] = useState(false);

  if (!folder) {
    return null;
  }

  const children = folders.filter((f) => f.parentId === folderId);
  const isActive = currentFolderId === folderId;

  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (children.length > 0) {
      setExpanded(!expanded);
    }
  };

  const handleFolderClick = () => {
    dispatch(setCurrentFolder(folderId));
    if (children.length > 0) {
      setExpanded(!expanded);
    }
  };

  const indentWidth = level * 16;

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-1.5 py-1.5 pr-2 rounded-md cursor-pointer hover:bg-accent transition-colors',
          isActive && 'bg-accent'
        )}
        style={{ paddingLeft: `${indentWidth + 8}px`, minWidth: 'max-content' }}
        onClick={handleFolderClick}
      >
        {level > 0 && (
          <>
            {parentPath.map((isParentLast, idx) => {
              if (isParentLast) return null;
              const lineLeft = idx * 16 + 8;
              return (
                <div
                  key={idx}
                  className="absolute top-0 bottom-0 w-[1px] bg-border opacity-40"
                  style={{ left: `${lineLeft}px` }}
                />
              );
            })}
            <div
              className="absolute top-1/2 w-2 h-[1px] bg-border opacity-40"
              style={{ left: `${indentWidth - 8}px` }}
            />
            {!isLast && (
              <div
                className="absolute top-1/2 bottom-0 w-[1px] bg-border opacity-40"
                style={{ left: `${indentWidth - 8}px` }}
              />
            )}
          </>
        )}

        <div 
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center cursor-pointer"
          onClick={handleChevronClick}
        >
          {children.length > 0 ? (
            expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
        </div>

        <Folder className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm whitespace-nowrap">{folder.name}</span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="break-words">{folder.name}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {expanded && (
        <div>
          {children.map((child, index) => (
            <FolderTreeItem
              key={child.id}
              folderId={child.id}
              level={level + 1}
              isLast={index === children.length - 1}
              parentPath={[...parentPath, !isLast]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderTree = () => {
  const dispatch = useAppDispatch();
  const { folders, currentFolderId } = useAppSelector((state) => state.folder);
  const { activeDataRoomId, dataRooms } = useAppSelector((state) => state.dataroom);
  const [companyExpanded, setCompanyExpanded] = useState(true);

  if (!activeDataRoomId) {
    return (
      <div className="p-4 text-sm text-muted-foreground">Select a data room to view folders</div>
    );
  }

  const rootFolders = folders.filter((f) => f.parentId === null && f.dataRoomId === activeDataRoomId);
  const activeRoom = dataRooms.find((r) => r.id === activeDataRoomId);
  const companyName = activeRoom?.name || 'Company 1';
  const isCompanyActive = currentFolderId === null;

  const handleCompanyChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rootFolders.length > 0) {
      setCompanyExpanded(!companyExpanded);
    }
  };

  const handleCompanyClick = () => {
    dispatch(setCurrentFolder(null));
    if (rootFolders.length > 0) {
      setCompanyExpanded(!companyExpanded);
    }
  };

  return (
    <div className="p-2" style={{ minWidth: 'max-content' }}>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent transition-colors',
          isCompanyActive && 'bg-accent'
        )}
        style={{ minWidth: 'max-content' }}
        onClick={handleCompanyClick}
      >
        <div 
          className="flex-shrink-0 w-4 h-4 flex items-center justify-center cursor-pointer"
          onClick={handleCompanyChevronClick}
        >
          {rootFolders.length > 0 ? (
            companyExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : (
            <div className="w-4" />
          )}
        </div>
        <Database className="h-4 w-4 text-muted-foreground" />
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-sm whitespace-nowrap font-medium">{companyName}</span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="break-words">{companyName}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      {companyExpanded && rootFolders.length > 0 && (
        <div className="mt-1">
          {rootFolders.map((folder, index) => (
            <FolderTreeItem
              key={folder.id}
              folderId={folder.id}
              level={0}
              isLast={index === rootFolders.length - 1}
              parentPath={[]}
            />
          ))}
        </div>
      )}
      {companyExpanded && rootFolders.length === 0 && (
        <div className="p-4 text-sm text-muted-foreground text-center">No folders yet</div>
      )}
    </div>
  );
};

