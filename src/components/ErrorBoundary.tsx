import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[50vh] flex items-center justify-center bg-black text-white p-8">
          <div className="text-center max-w-md">
            <div className="text-[#9b5fd6] text-6xl mb-6">⚠︎</div>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Algo salió mal</h2>
            <p className="text-[#8a7fa0] mb-8">Estamos trabajando en ello. Por favor recarga la página.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 border border-white/20 hover:bg-white hover:text-black transition rounded-full text-sm tracking-[1.5px]"
            >
              RECARGAR
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
