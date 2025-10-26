import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="w-8 h-8 text-purple-500" />
        <p className="text-white/60 text-sm">Carregando DUA Vision...</p>
      </div>
    </div>
  )
}
