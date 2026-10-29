import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

function traduzirErro(erro: unknown): string {
  const codigo = (erro as { code?: string }).code

  switch (codigo) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'E-mail ou senha incorretos.'
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Espere um pouco e tente de novo.'
    case 'auth/network-request-failed':
      return 'Sem conexão. Confira a internet.'
    default:
      return 'Não foi possível entrar. Tente de novo.'
  }
}

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [entrando, setEntrando] = useState(false)

  async function entrar() {
    setErro('')
    setEntrando(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha)
      // Deu certo: o App percebe sozinho que tem alguém logado e troca a tela.
    } catch (e) {
      setErro(traduzirErro(e))
      setEntrando(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-bark-100 p-4'>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          entrar()
        }}
        className='flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-white/60 p-6 text-leaf-800 shadow-xl backdrop-blur-md'
      >
        <h1 className='text-center text-4xl font-bold'>Miyt</h1>
        <p className='text-center text-sm text-leaf-600'>
          Entre pra ver o cardápio de vocês.
        </p>

        <label className='flex flex-col gap-1 text-sm font-semibold'>
          E-mail
          <input
            type='email'
            value={email}
            autoComplete='email'
            onChange={(e) => setEmail(e.target.value)}
            className='rounded-lg bg-white px-3 py-2 font-normal outline-none ring-1 ring-leaf-400 focus:ring-2'
          />
        </label>

        <label className='flex flex-col gap-1 text-sm font-semibold'>
          Senha
          <input
            type='password'
            value={senha}
            autoComplete='current-password'
            onChange={(e) => setSenha(e.target.value)}
            className='rounded-lg bg-white px-3 py-2 font-normal outline-none ring-1 ring-leaf-400 focus:ring-2'
          />
        </label>

        {erro && (
          <p className='text-center text-sm font-semibold text-petal-600'>{erro}</p>
        )}

        <button
          type='submit'
          disabled={entrando || !email.trim() || !senha}
          className='rounded-xl bg-leaf-600 px-4 py-2 font-semibold text-white disabled:opacity-50'
        >
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}