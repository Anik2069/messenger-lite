import React, { useState } from "react";
import Modal from "@/components/reusable/Modal";
import { useChatStore } from "@/store/useChatStore";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SearchModal = () => {
  const { showSearch, setShowSearch } = useChatStore();
  const [searchText, setSearchText] = useState("");

  const handleClose = () => {
    setShowSearch(false);
    setSearchText("");
  };

  return (
    <Modal open={showSearch} onClose={handleClose} title="Search" maxWidth="md">
      <div className="flex items-center space-x-2 border rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
        <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <Input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base"
          autoFocus
        />
      </div>
      {/* Future search results can go here */}
      <div className="mt-4">
        {searchText && (
          <p className="text-sm text-gray-500 text-center">
            Searching for {searchText}...
          </p>
        )}
      </div>
    </Modal>
  );
};

export default SearchModal;
