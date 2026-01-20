// Componente reutilizable de UserButton personalizado
'use client';

import { UserButton } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-theme';

export default function CustomUserButton() {
  return (
    <UserButton
      appearance={clerkAppearance}
      afterSignOutUrl="/login"
      userProfileMode="modal"
      userProfileProps={{
        appearance: clerkAppearance,
      }}
    />
  );
}
