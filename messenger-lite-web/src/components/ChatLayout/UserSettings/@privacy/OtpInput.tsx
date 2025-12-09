import { useController, useFormContext } from 'react-hook-form';
import { useRef, useEffect, useState } from 'react';

type OtpInputProps = {
  name: string;
  length: number;
  setupError?: boolean;
};

export function OtpInput({ name, length, setupError }: OtpInputProps) {
  const { control, setValue, getValues, watch } = useFormContext();
  const { field } = useController({ name, control });
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [shake, setShake] = useState(false);

  // Watch for reset() or value clear from parent
  const otpValue = watch(name);

  // 👉 Automatically clear input boxes if reset() was called
  useEffect(() => {
    if (!otpValue) {
      inputsRef.current.forEach((input) => {
        if (input) input.value = '';
      });
    }
  }, [otpValue]);

  // Shake animation on error
  useEffect(() => {
    if (setupError) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [setupError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const current = getValues(name)?.split('') || [];
    current[index] = val;
    const newVal = current.join('').slice(0, length);
    setValue(name, newVal);

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !getValues(name)[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').trim();
    if (!/^\d+$/.test(pasteData)) return;

    const chars = pasteData.split('').slice(0, length);
    setValue(name, chars.join(''));

    chars.forEach((char, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i]!.value = char;
      }
    });

    const lastIndex = Math.min(chars.length - 1, length - 1);
    inputsRef.current[lastIndex]?.focus();
  };

  const valueArray = (field.value || '').padEnd(length, '').split('');

  return (
    <div className={`flex gap-2 justify-center mt-2 ${shake ? 'animate-shake' : ''}`}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          className={`w-12 h-12 text-center border rounded-lg text-lg focus:outline-none focus:border-blue-500 ${
            setupError ? 'border-red-500' : 'border-gray-300'
          }`}
          value={valueArray[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleBackspace(e, i)}
          onPaste={(e) => handlePaste(e)}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
