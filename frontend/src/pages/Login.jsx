import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <form
                onSubmit={handleSubmit}
                className={`w-full max-w-sm bg-white border-4 rounded-xl p-8 flex flex-col gap-5 transition-colors duration-300 ${error ? 'border-red-700' : 'border-teal-700'
                    }`}
            >
                <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>

                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-semibold text-slate-900">
                        Correo
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-semibold text-slate-900">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-slate-300 rounded-lg px-3 py-2"
                    />
                </div>

                {error && (
                    <p role="alert" className="text-sm text-red-800 bg-red-100 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <button
                    type={error ? 'button' : 'submit'}
                    disabled={loading}
                    onClick={
                        error
                            ? (e) => {
                                e.preventDefault()
                                setError('')
                            }
                            : undefined
                    }
                    className={`relative overflow-hidden flex items-center justify-center text-white font-semibold rounded-lg py-3 transition-colors duration-300 disabled:opacity-80 ${error ? 'bg-red-700 hover:bg-red-800' : 'bg-teal-700 hover:bg-teal-800'
                        }`}
                >
                    {/* Línea normal, animada */}
                    <svg
                        viewBox="0 0 300 40"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${error ? 'opacity-0' : 'opacity-40'
                            }`}
                    >
                        <path
                            className="ecg-line"
                            pathLength="100"
                            d="M0 20 H25 L31 6 L39 34 L45 20 H125 L131 6 L139 34 L145 20 H225 L231 6 L239 34 L245 20 H300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* Línea con fallo: un latido y luego plana */}
                    <svg
                        viewBox="0 0 300 40"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${error ? 'opacity-40' : 'opacity-0'
                            }`}
                    >
                        <path
                            d="M0 20 H25 L31 6 L39 34 L45 20 H300"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>

                    {/* Textos apilados, uno se funde con el otro */}
                    <span className="relative z-10 grid">
                        <span
                            aria-hidden={!!error}
                            className={`col-start-1 row-start-1 transition-opacity duration-300 ${error ? 'opacity-0' : 'opacity-100'
                                }`}
                        >
                            Ingresar
                        </span>
                        <span
                            aria-hidden={!error}
                            className={`col-start-1 row-start-1 transition-opacity duration-300 ${error ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            Reintentar
                        </span>
                    </span>
                </button>
            </form>
        </main>
    )
}

export default Login