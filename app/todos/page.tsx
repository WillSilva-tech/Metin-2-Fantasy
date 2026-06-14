import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  let todos: any[] | null = null;
  let error: any = null;

  if (!supabase) {
    error = { message: 'Configuração ausente: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY não foram definidos.' };
  } else {
    // Fetch todos from Supabase table
    const response = await supabase.from('todos').select();
    todos = response.data;
    error = response.error;
  }

  if (error) {
    console.error('Error fetching todos:', error)
  }

  return (
    <div className="min-h-screen bg-[#080402] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-gradient-to-b from-[#150A04] to-[#080402] border border-[#FF6A00]/20 rounded-lg p-8 shadow-2xl">
        <h1 className="font-serif text-2xl font-bold text-center tracking-widest text-[#FFD700] uppercase mb-1">
          Supabase Test
        </h1>
        <p className="text-stone-400 text-xs text-center mb-6">
          Server-Side Rendered Todos direct from your Supabase instance
        </p>

        {error ? (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded text-center">
            Erro ao conectar com o Supabase: {error.message}
          </div>
        ) : !todos || todos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-stone-500 italic">Nenhum todo encontrado.</p>
            <p className="text-xs text-stone-600 mt-2">
              Seu banco de dados está conectado com sucesso! Crie uma tabela chamada <code className="bg-[#080402] px-1.5 py-0.5 rounded text-primary">todos</code> no Supabase com as colunas <code className="bg-[#080402] px-1.5 py-0.5 rounded text-primary">id</code> (int8) e <code className="bg-[#080402] px-1.5 py-0.5 rounded text-primary">name</code> (text) para visualizar os registros.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li 
                key={todo.id} 
                className="flex items-center gap-3 px-4 py-3 bg-[#080402]/60 border border-white/5 rounded text-sm hover:border-[#FF6A00]/30 transition-colors"
                id={`todo-item-${todo.id}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
                <span className="font-mono text-[#BCAD9E]">{todo.name}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 pt-4 border-t border-white/5 text-center">
          <Link 
            href="/"
            className="text-xs text-[#FF6A00] hover:underline font-serif uppercase tracking-widest"
          >
            ← Voltar para o Portal Fantasy2
          </Link>
        </div>
      </div>
    </div>
  )
}
