import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Si les variables Supabase ne sont pas configurées, laisser passer
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
    return NextResponse.next()
  }

  try {
    const { createServerClient } = await import('@supabase/ssr')
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const protectedRoutes = ['/etudiant', '/encadrant', '/service-stages', '/admin']
    const isProtected = protectedRoutes.some(r => pathname.startsWith(r))

    if (isProtected && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && pathname === '/login') {
      const { data: util } = await supabase
        .from('utilisateur')
        .select('role')
        .eq('id_utilisateur', user.id)
        .single()
      if (util?.role) {
        const roleMap: Record<string, string> = {
          etudiant: '/etudiant/dashboard',
          encadrant: '/encadrant/dashboard',
          service_stages: '/service-stages/dashboard',
          administrateur: '/admin/dashboard',
        }
        return NextResponse.redirect(new URL(roleMap[util.role] || '/', request.url))
      }
    }

    return supabaseResponse
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
