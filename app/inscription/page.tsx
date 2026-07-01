'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function InscriptionPage() {
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '',
    password: '', confirmPassword: '',
    role: 'etudiant',
    matricule: '', filiere: 'Genie Logiciel et Systemes d Information', niveau: 'L2',
    departement: 'Genie Informatique',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    setGoogleLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.prenom || !form.nom || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres.')
      return
    }
    if (form.role === 'etudiant' && !form.matricule) {
      setError('Le matricule est obligatoire pour un etudiant.')
      return
    }

    setLoading(true)
    try {
      // 1. Creer le compte dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            prenom: form.prenom,
            nom: form.nom,
            role: form.role,
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('Un compte existe deja avec cet email.')
        } else {
          setError('Erreur : ' + authError.message)
        }
        setLoading(false)
        return
      }

      if (!authData.user) {
        setError('Erreur lors de la creation du compte.')
        setLoading(false)
        return
      }

      const userId = authData.user.id

      // 2. Inserer dans la table utilisateur
      const { error: utilError } = await supabase
        .from('utilisateur')
        .insert({
          id_utilisateur: userId,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          motdepasse: '',
          role: form.role,
          actif: true,
          datecreation: new Date().toISOString(),
        })

      if (utilError) {
        console.error('Erreur utilisateur:', utilError)
        // Continuer quand meme - la table sera mise a jour via trigger ou manuellement
      }

      // 3. Inserer le profil specifique selon le role
      if (form.role === 'etudiant') {
        await supabase.from('etudiant').insert({
          id_utilisateur: userId,
          matricule: form.matricule,
          filiere: form.filiere,
          niveau: form.niveau,
        })
      } else if (form.role === 'encadrant') {
        await supabase.from('encadrant').insert({
          id_utilisateur: userId,
          departement: form.departement,
        })
      }

      // 4. Si l'utilisateur est directement connecte (pas de confirmation email)
      if (authData.session) {
        const roleMap: Record<string, string> = {
          etudiant: '/etudiant/dashboard',
          encadrant: '/encadrant/dashboard',
        }
        router.push(roleMap[form.role] || '/')
        router.refresh()
      } else {
        // Email de confirmation envoye
        setSuccess(true)
      }

    } catch (err: any) {
      setError('Une erreur est survenue : ' + (err.message || 'Veuillez reessayer.'))
    }
    setLoading(false)
  }

  const EyeIcon = ({ visible }: { visible: boolean }) => visible ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )

  // Ecran de succes
  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80')` }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 bg-white/95 rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[#1E3A5F] mb-3">Compte cree !</h2>
          <p className="text-slate-600 mb-2">
            Un email de confirmation a ete envoye a <strong>{form.email}</strong>.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Verifiez votre boite mail et cliquez sur le lien pour activer votre compte,
            puis connectez-vous.
          </p>
          <Link href="/login"
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold px-8 py-3 rounded-xl transition-colors inline-block">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&q=80')` }} />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-lg mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-[#F59E0B] rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-black text-2xl">G</span>
            </div>
            <span className="text-white font-black text-lg block leading-tight text-center">
              Gestion des Demandes de Stages
            </span>
          </Link>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-black text-[#1E3A5F] mb-1 text-center">Creer un compte</h2>
          <p className="text-slate-500 text-sm text-center mb-6">Rejoignez la plateforme SGDS</p>

          {/* Bouton Google */}
          <button onClick={handleGoogleSignup} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 rounded-xl transition-all mb-5 disabled:opacity-60">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Redirection...' : "S'inscrire avec Google"}
          </button>

          <div className="flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm flex gap-2 items-start">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Je suis *</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent text-sm bg-white">
                <option value="etudiant">Etudiant</option>
                <option value="encadrant">Encadrant pedagogique</option>
              </select>
            </div>

            {/* Prenom + Nom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Prenom *</label>
                <input name="prenom" value={form.prenom} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  placeholder="Votre prenom" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Nom *</label>
                <input name="nom" value={form.nom} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  placeholder="Votre nom" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                placeholder="votre@email.com" />
            </div>

            {/* Champs etudiant */}
            {form.role === 'etudiant' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Matricule *</label>
                  <input name="matricule" value={form.matricule} onChange={handleChange} required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                    placeholder="ESP-2024-XXX" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Niveau *</label>
                  <select name="niveau" value={form.niveau} onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-white">
                    <option>L1</option><option>L2</option><option>L3</option>
                    <option>M1</option><option>M2</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Filiere *</label>
                  <select name="filiere" value={form.filiere} onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent bg-white">
                    <option>Genie Logiciel et Systemes d Information</option>
                    <option>Genie Informatique</option>
                    <option>Reseaux et Telecommunications</option>
                    <option>Genie Civil</option>
                    <option>Genie Electrique</option>
                    <option>Genie Mecanique</option>
                  </select>
                </div>
              </div>
            )}

            {/* Champ encadrant */}
            {form.role === 'encadrant' && (
              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Departement *</label>
                <input name="departement" value={form.departement} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  placeholder="Ex: Genie Informatique" />
              </div>
            )}

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Mot de passe *</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={form.password} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  placeholder="Minimum 8 caracteres" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            {/* Confirmer */}
            <div>
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-1.5">Confirmer le mot de passe *</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange} required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:border-transparent"
                  placeholder="Retapez votre mot de passe" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" tabIndex={-1}>
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</p>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length > 0 && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Mots de passe identiques
                </p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-base shadow-lg shadow-amber-500/25 mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creation en cours...
                </span>
              ) : 'Creer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Deja inscrit ?{' '}
            <Link href="/login" className="text-[#1E3A5F] hover:text-[#F59E0B] font-semibold transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
