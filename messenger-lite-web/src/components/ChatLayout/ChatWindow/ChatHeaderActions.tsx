'use client';

import { Button } from '@/components/ui/button';
import { EllipsisVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'react-toastify';
import { useChatStore } from '@/store/useChatStore';
import { useGlobalContext } from '@/provider/GlobalContextProvider';
const ChatHeaderActions = ({ conversationId }: { conversationId: string }) => {
  const { handleClearConversation } = useChatStore();
  const { openSelectedChatProfile } = useGlobalContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="cursor-pointer" variant="ghost" size={'icon'}>
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuItem
          onClick={() => {
            openSelectedChatProfile();
            console.log('Profile');
          }}
        >
          View profile{' '}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        {/* <DropdownMenuItem onClick={() => console.log("Profile")}>
          New group
        </DropdownMenuItem> */}
        <DropdownMenuItem
          onClick={() => {
            openSelectedChatProfile();
            console.log('Media, link and docs');
          }}
        >
          Media, link and docs
        </DropdownMenuItem>
        {/* <DropdownMenuItem onClick={() => console.log("Logout")}>
          Chat Theme
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            toast.success('Reported');
            console.log('this is a demo action!');
          }}
        >
          Report
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          variant="destructive"
          onClick={() => console.log("Logout")}
        >
          Block
        </DropdownMenuItem> */}
        <DropdownMenuItem
          variant="destructive"
          onClick={() => handleClearConversation(conversationId)}
        >
          Clear Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatHeaderActions;
