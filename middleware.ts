import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Definir rutas protegidas
const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/inventario(.*)',
    '/equipos-criticos(.*)',
    '/plan-mantenimiento(.*)',
    '/reportes(.*)',
    '/categorias(.*)',
    '/admin(.*)'
]);

// Definir rutas de administrador
const isAdminRoute = createRouteMatcher([
    '/admin(.*)'
]);

const isPublicRoute = createRouteMatcher([
    '/login(.*)',
    '/registro(.*)',
    '/api/public(.*)',
    '/'
]);

export default clerkMiddleware(async (auth, req) => {
    // Si es ruta pública, permitir acceso
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // Protección de autenticación básica
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    // Protección de roles para rutas de administrador
    if (isAdminRoute(req)) {
        const { sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        // Permitir acceso solo a admin y super_admin
        if (role !== 'admin' && role !== 'super_admin') {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
