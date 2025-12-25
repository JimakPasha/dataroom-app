import { createContext, useContext, useState, ReactNode } from 'react';

interface DialogContextType {
  isCreateFolderDialogOpen: boolean;
  isCreateDataRoomDialogOpen: boolean;
  isRenameDialogOpen: boolean;
  isRenameDataRoomDialogOpen: boolean;
  isDeleteDataRoomDialogOpen: boolean;
  isDeleteItemDialogOpen: boolean;
  isFolderInfoDialogOpen: boolean;
  isItemInfoDialogOpen: boolean;
  isSearchDialogOpen: boolean;
  
  openCreateFolderDialog: () => void;
  closeCreateFolderDialog: () => void;
  openCreateDataRoomDialog: () => void;
  closeCreateDataRoomDialog: () => void;
  openRenameDialog: () => void;
  closeRenameDialog: () => void;
  openRenameDataRoomDialog: () => void;
  closeRenameDataRoomDialog: () => void;
  openDeleteDataRoomDialog: () => void;
  closeDeleteDataRoomDialog: () => void;
  openDeleteItemDialog: () => void;
  closeDeleteItemDialog: () => void;
  openFolderInfoDialog: () => void;
  closeFolderInfoDialog: () => void;
  openItemInfoDialog: () => void;
  closeItemInfoDialog: () => void;
  openSearchDialog: () => void;
  closeSearchDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  const [isCreateDataRoomDialogOpen, setIsCreateDataRoomDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isRenameDataRoomDialogOpen, setIsRenameDataRoomDialogOpen] = useState(false);
  const [isDeleteDataRoomDialogOpen, setIsDeleteDataRoomDialogOpen] = useState(false);
  const [isDeleteItemDialogOpen, setIsDeleteItemDialogOpen] = useState(false);
  const [isFolderInfoDialogOpen, setIsFolderInfoDialogOpen] = useState(false);
  const [isItemInfoDialogOpen, setIsItemInfoDialogOpen] = useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);

  return (
    <DialogContext.Provider
      value={{
        isCreateFolderDialogOpen,
        isCreateDataRoomDialogOpen,
        isRenameDialogOpen,
        isRenameDataRoomDialogOpen,
        isDeleteDataRoomDialogOpen,
        isDeleteItemDialogOpen,
        isFolderInfoDialogOpen,
        isItemInfoDialogOpen,
        isSearchDialogOpen,
        openCreateFolderDialog: () => setIsCreateFolderDialogOpen(true),
        closeCreateFolderDialog: () => setIsCreateFolderDialogOpen(false),
        openCreateDataRoomDialog: () => setIsCreateDataRoomDialogOpen(true),
        closeCreateDataRoomDialog: () => setIsCreateDataRoomDialogOpen(false),
        openRenameDialog: () => setIsRenameDialogOpen(true),
        closeRenameDialog: () => setIsRenameDialogOpen(false),
        openRenameDataRoomDialog: () => setIsRenameDataRoomDialogOpen(true),
        closeRenameDataRoomDialog: () => setIsRenameDataRoomDialogOpen(false),
        openDeleteDataRoomDialog: () => setIsDeleteDataRoomDialogOpen(true),
        closeDeleteDataRoomDialog: () => setIsDeleteDataRoomDialogOpen(false),
        openDeleteItemDialog: () => setIsDeleteItemDialogOpen(true),
        closeDeleteItemDialog: () => setIsDeleteItemDialogOpen(false),
        openFolderInfoDialog: () => setIsFolderInfoDialogOpen(true),
        closeFolderInfoDialog: () => setIsFolderInfoDialogOpen(false),
        openItemInfoDialog: () => setIsItemInfoDialogOpen(true),
        closeItemInfoDialog: () => setIsItemInfoDialogOpen(false),
        openSearchDialog: () => setIsSearchDialogOpen(true),
        closeSearchDialog: () => setIsSearchDialogOpen(false),
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (context === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

