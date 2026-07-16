import { useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, Eye, Download,
  FileImage, FileSpreadsheet, FileText, Files, FolderOpen, Headset, Info,
  Lightbulb, RotateCcw, Search, ShieldCheck, UploadCloud,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/utils/formatters'
import { documentService } from '@/services/documentService'
import { API_BASE_URL } from '@/constants'
import type { DocumentCategory } from '@/types'

interface DocRow {
  id: string; name: string; mimeType: string; size: number
  category: DocumentCategory; createdAt: string
  linkedTo: string | null; docType: string | null
}

const CATEGORIES: DocumentCategory[] = ['INSURANCE', 'INVESTMENT', 'LOAN', 'KYC', 'INCOME', 'TAX', 'OTHER']
const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  INSURANCE: 'Insurance', INVESTMENT: 'Investment', LOAN: 'Loan', KYC: 'KYC', INCOME: 'Income', TAX: 'Tax', OTHER: 'Other',
}
const CATEGORY_PILL: Record<DocumentCategory, string> = {
  INSURANCE: 'bg-green-50 text-green-700', INVESTMENT: 'bg-blue-50 text-blue-700', LOAN: 'bg-amber-50 text-amber-700',
  KYC: 'bg-purple-50 text-purple-700', INCOME: 'bg-cyan-50 text-cyan-700', TAX: 'bg-red-50 text-red-700', OTHER: 'bg-slate-100 text-slate-600',
}

function fileIconFor(mimeType: string) {
  if (mimeType.includes('pdf')) return { icon: FileText, color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' }
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50', label: 'XLS' }
  if (mimeType.includes('image')) return { icon: FileImage, color: 'text-blue-500', bg: 'bg-blue-50', label: 'IMG' }
  return { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', label: 'DOC' }
}

const TIPS = [
  'Upload clear and valid documents for faster processing.',
  'Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.',
  'Keep your important documents updated.',
  'Your documents are secure and encrypted.',
]

export function DocumentsPage() {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['documents', page, category, search],
    queryFn: async () => {
      const res = await documentService.getAll({ page, limit: 20, category: category || undefined, search: search || undefined } as any)
      return (res.data as any) as { data: DocRow[]; meta: { total: number; pages: number; byCategory: Record<string, number> } }
    },
  })

  const docs = data?.data ?? []
  const meta = data?.meta

  const stats = useMemo(() => {
    const byCategory = meta?.byCategory ?? {}
    const total = Object.values(byCategory).reduce((s, n) => s + n, 0)
    return [
      { label: 'Total Documents', value: String(total), sub: 'All Uploaded Documents', icon: Files, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Insurance Documents', value: String(byCategory.INSURANCE ?? 0), sub: 'Insurance related', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Loan Documents', value: String(byCategory.LOAN ?? 0), sub: 'Loan related', icon: FolderOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Other Documents', value: String((byCategory.KYC ?? 0) + (byCategory.OTHER ?? 0) + (byCategory.TAX ?? 0) + (byCategory.INCOME ?? 0)), sub: 'Other & personal', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    ]
  }, [meta])

  const resetFilters = () => { setSearch(''); setCategory(''); setPage(1) }

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (list.length === 0) return
    setUploading(true)
    try {
      await Promise.all(list.map(file => documentService.upload(file, { category: 'OTHER' })))
      toast.success(`${list.length} file${list.length > 1 ? 's' : ''} uploaded successfully!`)
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch {
      toast.error('Some files failed to upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-full bg-white p-4 sm:p-5">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-[#11194f]">Documents</h1>
            <nav className="mt-3 flex items-center gap-2 text-xs font-bold">
              <span className="text-green-700">Home</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#11194f]">Documents</span>
            </nav>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3">
          <Info size={16} className="shrink-0 text-blue-600" />
          <p className="text-[12px] font-bold text-[#253261]">
            Manage and store all your important policy, loan and personal documents securely.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_285px]">
          <main className="space-y-4">
            <Card padding="sm" className="rounded-lg">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map(stat => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.bg}`}>
                        <Icon size={17} className={stat.color} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-[#64729b]">{stat.label}</p>
                        <p className="text-lg font-extrabold leading-tight text-[#11194f]">{stat.value}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-[#64729b]">{stat.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[200px] flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search documents by name..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-[12px] font-semibold text-slate-800 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <select
                  value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                </select>
                <Button variant="outline" size="sm" leftIcon={<RotateCcw size={13} />} onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-[#34406f]">
                      {['Document Name', 'Category', 'Type', 'Uploaded On', 'Linked To', 'Actions'].map(h => (
                        <th key={h} className="whitespace-nowrap px-3 py-2.5 first:rounded-l-lg last:rounded-r-lg">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {!isLoading && docs.length === 0 && (
                      <tr><td colSpan={6} className="px-3 py-10 text-center text-sm font-semibold text-[#64729b]">No documents match your filters.</td></tr>
                    )}
                    {docs.map(doc => {
                      const fi = fileIconFor(doc.mimeType)
                      const Icon = fi.icon
                      return (
                        <tr key={doc.id} className="text-[13px]">
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${fi.bg}`}>
                                <Icon size={15} className={fi.color} />
                              </div>
                              <span className="font-bold text-[#253261]">{doc.name}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${CATEGORY_PILL[doc.category]}`}>
                              {CATEGORY_LABEL[doc.category]}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{doc.docType ?? '—'}</td>
                          <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{formatDate(doc.createdAt)}</td>
                          <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{doc.linkedTo ?? '--'}</td>
                          <td className="whitespace-nowrap px-3 py-3.5">
                            <div className="flex items-center gap-0.5 text-slate-400">
                              <a href={`${API_BASE_URL}/documents/${doc.id}/download`} target="_blank" rel="noreferrer" title="Download" className="rounded p-1.5 hover:bg-slate-50 hover:text-green-600 inline-block">
                                <Download size={15} />
                              </a>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {meta && meta.pages > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-4">
                  <p className="text-[12px] font-semibold text-[#64729b]">Page {page} of {meta.pages} ({meta.total} documents)</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button" disabled={page === meta.pages} onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                  <Headset size={17} className="text-indigo-600" />
                </div>
                <div className="min-w-[220px] flex-1">
                  <p className="text-sm font-extrabold text-[#11194f]">Need help managing your documents?</p>
                  <p className="text-[12px] font-semibold text-[#64729b]">Our support team is here to help you.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500" leftIcon={<Headset size={14} />} onClick={() => toast.success('Connecting you to support')}>
                  Contact Support
                </Button>
              </div>
            </Card>
          </main>

          <aside className="space-y-3">
            <Card padding="sm" className="rounded-lg">
              <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Upload Document</h3>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
                className={`flex flex-col items-center rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors ${dragOver ? 'border-green-500 bg-green-50' : 'border-green-300 bg-green-50/40'}`}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                  <UploadCloud size={20} className="text-green-600" />
                </div>
                <p className="text-[12px] font-bold text-[#253261]">Drag &amp; drop your file here</p>
                <p className="my-1.5 text-[11px] font-semibold text-[#64729b]">or</p>
                <Button size="sm" leftIcon={<FolderOpen size={13} />} loading={uploading} onClick={() => fileInputRef.current?.click()}>
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef} type="file" multiple className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={e => { if (e.target.files) uploadFiles(e.target.files); e.target.value = '' }}
                />
              </div>
              <p className="mt-3 text-[10px] font-semibold leading-relaxed text-[#64729b]">
                Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX<br />Max file size: 10MB
              </p>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Document Categories</h3>
              <div className="space-y-3">
                {CATEGORIES.map(c => (
                  <div key={c} className="flex items-center gap-3">
                    <span className={`flex-1 text-[12px] font-bold text-[#253261]`}>{CATEGORY_LABEL[c]}</span>
                    <span className="text-[12px] font-extrabold text-[#11194f]">{meta?.byCategory?.[c] ?? 0}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb size={18} className="text-amber-500" />
                <h3 className="text-sm font-extrabold text-[#11194f]">Tips</h3>
              </div>
              <ul className="space-y-2.5">
                {TIPS.map(tip => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 fill-green-500 text-white" />
                    <span className="text-[12px] font-semibold text-[#34406f]">{tip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  )
}
