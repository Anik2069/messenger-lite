import { Card, CardFooter } from '@/components/ui/card';
import { useState } from 'react';
import { SelectFriends } from './SelectFriends';
import { CreateGroupForm } from './CreateGroupForm';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useFriendsStore } from '@/store/useFriendsStrore';

const CreateGroup = () => {
    const { selectedUsers } = useFriendsStore()
    const [step, setStep] = useState<1 | 2>(1);

    return (
        <div className='border-0 p-0 px-4 pt-4 m-0 shadow-none gap-3.5 flex flex-col dark:bg-transparent relative'>
            {step === 1 ? (
                <SelectFriends />
            ) : (
                <CreateGroupForm
                    onBack={() => setStep(1)}
                />
            )}
            {step === 1 && selectedUsers.length > 0 && (
                <div className="sticky bottom-3 left-4 z-10 w-full">
                    <div className=" flex justify-end">
                        <Button
                            onClick={() => setStep(2)}
                            className=" duration-300 transition-all ease-in-out bg-green-700 hover:bg-green-600 text-sm h-9 px-4 w-fit rounded-full pointer-events-auto shadow-md"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateGroup;