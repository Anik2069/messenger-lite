import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Check, X } from 'lucide-react';
import { ProfileImage } from '../UserSettings/@general/ProfileImage';
import { useFriendsStore } from '@/store/useFriendsStrore';
import Image from 'next/image';
import { DummyAvatar } from '@/assets/image';
import { MEDIA_HOST } from '@/constant';

import { toast } from 'react-toastify';
import AnimatedWrapper from '@/components/animations/AnimatedWrapper';
import { useGlobalContext } from '@/provider/GlobalContextProvider';

const groupSchema = z.object({
    name: z.string().min(1, 'Group name is required').max(50, 'Group name must be less than 50 characters'),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface CreateGroupFormProps {
    onBack: () => void;
}

export const CreateGroupForm = ({ onBack }: CreateGroupFormProps) => {
    const { createGroupModalClose } = useGlobalContext();
    const { selectedUsers, createGroup } = useFriendsStore();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<GroupFormValues>({
        resolver: zodResolver(groupSchema),
        defaultValues: { name: '' },
    });

    const onSubmit = async (data: GroupFormValues) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', data.name);

            // Append all member IDs
            selectedUsers.forEach((user) => {
                formData.append('memberIds[]', user.id);
            });

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const res = await createGroup(formData);

            console.log(res)
            if ((res as Record<string, any>).status === 201) { // eslint-disable-line @typescript-eslint/no-explicit-any
                createGroupModalClose();
            }
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error('Failed to create group:', error);
            toast.error(error?.response?.data?.message || 'Failed to create group');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[60vh]">
            <CardHeader className="p-0 space-y-1">
                <div className="flex items-center gap-2">
                    <button onClick={onBack} className="p-1 rounded-full hover:bg-muted transition-colors">
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Group Info</h2>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-600 w-full"></div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col overflow-y-auto scrollbar-none pb-10">
                <form id="group-form" onSubmit={handleSubmit(onSubmit)} className="space-y-2 flex-1 pt-2 ">
                    <div className="flex items-center gap-2">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative">
                                <div className="mx-auto relative w-16 h-16">
                                    <ProfileImage
                                        showHoverMeaage={false}
                                        className="w-16 h-16"
                                        currentImage={avatarPreview}
                                        onImageChange={(file, preview) => {
                                            setAvatarFile(file);
                                            setAvatarPreview(preview);
                                        }}
                                    />
                                    {avatarFile && (
                                        <AnimatedWrapper
                                            type="fade"
                                            duration={200}
                                            className="absolute top-0 right-0 flex gap-1"
                                        >
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAvatarFile(null);
                                                    setAvatarPreview(null);
                                                }}
                                                className={`cursor-pointer p-1 rounded-full bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-800 transition-colors shadow-sm`}
                                                title="Remove Avatar"
                                            >
                                                <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                                            </button>
                                        </AnimatedWrapper>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Group Name Section */}
                        <div className="space-y-1 flex-1">

                            <input
                                {...register('name')}
                                type="text"
                                placeholder="Enter Group Name"
                                className={`w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white  focus:outline-none focus:ring-0  ${errors.name ? "border-red-500 dark:border-red-500" : ""}`}
                            />

                        </div>
                    </div>

                    {/* Selected Members Summary */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Members ({selectedUsers.length})
                        </label>
                        <div className="flex items-center flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="relative flex flex-col items-center gap-1 w-12 shrink-0">
                                    <Image
                                        src={user?.avatar ? MEDIA_HOST + '/' + user?.avatar : DummyAvatar}
                                        alt={user?.username || 'User'}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                    />
                                    <span className="text-[10px] truncate w-12 text-center text-muted-foreground">{user.username.split(' ')[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-4 right-4 z-10">
                        <Button
                            type="submit"
                            form="group-form"
                            disabled={loading || selectedUsers.length === 0}
                            className="duration-300 transition-all ease-in-out bg-green-700 hover:bg-green-600 text-sm h-9 w-fit rounded-full shadow-md"
                        >
                            {loading ? 'Creating...' : 'Confirm & Create'}
                            {!loading && <Check className="w-4 h-4 ml-1.5" />}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </div>
    );
};
