import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, Eye, Download,
  FileImage, FileSpreadsheet, FileText, Files, FolderOpen, Headset, Info,
  LayoutGrid, LayoutList, Lightbulb, Monitor, Cloud, HardDrive, Image, Clock,
  MoreVertical, RotateCcw, Search, ShieldCheck, UploadCloud,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

type DocCategory = 'Policy Document' | 'Loan Document' | 'Other Document'

interface DocRow {
  id: string
  name: string
  ext: 'pdf' | 'xlsx' | 'jpg' | 'png' | 'docx'
  category: DocCategory
  type: string
  uploadedOn: string
  linkedTo: string
}

const DOCS: DocRow[] = [
  { id: '1', name: 'Term Life Insurance Policy.pdf', ext: 'pdf', category: 'Policy Document', type: 'Policy Document', uploadedOn: '15 May 2025', linkedTo: 'Term Life Insurance' },
  { id: '2', name: 'Health Insurance Policy.pdf', ext: 'pdf', category: 'Policy Document', type: 'Policy Document', uploadedOn: '12 May 2025', linkedTo: 'Health Insurance' },
  { id: '3', name: 'Car Insurance Policy.pdf', ext: 'pdf', category: 'Policy Document', type: 'Policy Document', uploadedOn: '10 May 2025', linkedTo: 'Car Insurance' },
  { id: '4', name: 'Home Loan Sanction Letter.pdf', ext: 'pdf', category: 'Loan Document', type: 'Sanction Letter', uploadedOn: '08 May 2025', linkedTo: 'Home Loan' },
  { id: '5', name: 'Home Loan Statement - Apr 2025.pdf', ext: 'pdf', category: 'Loan Document', type: 'Loan Statement', uploadedOn: '05 May 2025', linkedTo: 'Home Loan' },
  { id: '6', name: 'Personal Financial Statement.xlsx', ext: 'xlsx', category: 'Other Document', type: 'Financial Statement', uploadedOn: '02 May 2025', linkedTo: '--' },
  { id: '7', name: 'PAN Card.jpg', ext: 'jpg', category: 'Other Document', type: 'ID Proof', uploadedOn: '28 Apr 2025', linkedTo: '--' },
  { id: '8', name: 'Aadhaar Card.jpg', ext: 'jpg', category: 'Other Document', type: 'ID Proof', uploadedOn: '28 Apr 2025', linkedTo: '--' },
]

const STATS = [
  { label: 'Total Documents', value: '28', sub: 'All Uploaded Documents', icon: Files, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Policy Documents', value: '12', sub: 'Insurance related', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Loan Documents', value: '8', sub: 'Loan related', icon: FolderOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Other Documents', value: '8', sub: 'Other & personal', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
]

const CATEGORIES: DocCategory[] = ['Policy Document', 'Loan Document', 'Other Document']
const DOC_TYPES = ['Policy Document', 'Sanction Letter', 'Loan Statement', 'Financial Statement', 'ID Proof']
const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year']

const CATEGORY_PILL: Record<DocCategory, string> = {
  'Policy Document': 'bg-green-50 text-green-700',
  'Loan Document': 'bg-amber-50 text-amber-700',
  'Other Document': 'bg-blue-50 text-blue-700',
}

const EXT_ICON = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  xlsx: { icon: FileSpreadsheet, color: 'text-green-600', bg: 'bg-green-50' },
  jpg: { icon: FileImage, color: 'text-blue-500', bg: 'bg-blue-50' },
  png: { icon: FileImage, color: 'text-purple-500', bg: 'bg-purple-50' },
  docx: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
}

const SIDEBAR_CATEGORIES = [
  { label: 'Policy Documents', count: 12, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Loan Documents', count: 8, icon: FolderOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  { label: 'Other Documents', count: 8, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'ID Proofs', count: 2, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
]

const TIPS = [
  'Upload clear and valid documents for faster processing.',
  'Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX.',
  'Keep your important documents updated.',
  'Your documents are secure and encrypted.',
]

const BROWSE_FILES = [
  { name: 'Term Life Insurance Policy.pdf', ext: 'pdf' as const, type: 'PDF', size: '1.2 MB', modified: '15 May 2025, 10:30 AM' },
  { name: 'Health Insurance Policy.pdf', ext: 'pdf' as const, type: 'PDF', size: '2.4 MB', modified: '12 May 2025, 04:15 PM' },
  { name: 'Home Loan Statement - Apr 2025.pdf', ext: 'pdf' as const, type: 'PDF', size: '1.8 MB', modified: '05 May 2025, 09:20 AM' },
  { name: 'PAN Card.jpg', ext: 'jpg' as const, type: 'JPG', size: '0.9 MB', modified: '28 Apr 2025, 11:45 AM' },
  { name: 'Aadhaar Card.jpg', ext: 'jpg' as const, type: 'JPG', size: '1.1 MB', modified: '28 Apr 2025, 11:45 AM' },
  { name: 'Bank Statement - May 2025.png', ext: 'png' as const, type: 'PNG', size: '2.0 MB', modified: '20 Apr 2025, 03:10 PM' },
  { name: 'Personal Financial Statement.xlsx', ext: 'xlsx' as const, type: 'XLSX', size: '1.3 MB', modified: '02 May 2025, 02:40 PM' },
  { name: 'Income Proof.docx', ext: 'docx' as const, type: 'DOCX', size: '1.0 MB', modified: '30 Apr 2025, 05:25 PM' },
]

const QUICK_ACCESS = [
  { label: 'Recent', icon: Clock },
  { label: 'Desktop', icon: Monitor },
  { label: 'Documents', icon: FileText },
  { label: 'Downloads', icon: Download },
  { label: 'Pictures', icon: Image },
]

const LOCATIONS = [
  { label: 'This PC', icon: HardDrive },
  { label: 'Google Drive', icon: Cloud },
  { label: 'OneDrive', icon: Cloud },
]

function FileIcon({ ext, size = 15 }: { ext: keyof typeof EXT_ICON; size?: number }) {
  const cfg = EXT_ICON[ext]
  const Icon = cfg.icon
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
      <Icon size={size} className={cfg.color} />
    </div>
  )
}

function BrowseFilesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [activeNav, setActiveNav] = useState('Recent')

  const files = BROWSE_FILES.filter(f => f.name.toLowerCase().includes(query.toLowerCase()))

  const toggle = (name: string) =>
    setSelected(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])

  const handleOpen = () => {
    toast.success(`${selected.length} file${selected.length > 1 ? 's' : ''} uploaded successfully!`)
    setSelected([])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Browse Files" description="Select files from your device to upload" size="full"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            size="sm" disabled={selected.length === 0} onClick={handleOpen}
            className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 disabled:opacity-50"
          >
            Open
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 sm:grid-cols-[170px_1fr]">
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-[12px] font-extrabold text-[#11194f]">Quick Access</p>
            <div className="space-y-0.5">
              {QUICK_ACCESS.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label} type="button" onClick={() => setActiveNav(item.label)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-bold transition-colors ${activeNav === item.label ? 'bg-blue-50 text-blue-700' : 'text-[#34406f] hover:bg-slate-50'}`}
                  >
                    <Icon size={14} /> {item.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-[12px] font-extrabold text-[#11194f]">Locations</p>
            <div className="space-y-0.5">
              {LOCATIONS.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.label} type="button"
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-bold text-[#34406f] transition-colors hover:bg-slate-50"
                  >
                    <Icon size={14} /> {item.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[160px] flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-[12px] font-semibold text-slate-800 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
              />
            </div>
            <p className="text-[12px] font-semibold text-[#64729b]">Sort by: <span className="font-bold text-[#253261]">Recently Modified</span></p>
            <div className="flex items-center gap-1">
              <button type="button" className="rounded p-1.5 text-blue-600 bg-blue-50"><LayoutList size={14} /></button>
              <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-50"><LayoutGrid size={14} /></button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-[#34406f]">
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Type</th>
                  <th className="px-2 py-2">Size</th>
                  <th className="whitespace-nowrap px-2 py-2">Modified</th>
                </tr>
              </thead>
              <tbody>
                {files.map(file => (
                  <tr
                    key={file.name} onClick={() => toggle(file.name)}
                    className={`cursor-pointer text-[12px] transition-colors ${selected.includes(file.name) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <FileIcon ext={file.ext} size={13} />
                        <span className="font-bold text-[#253261]">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 font-semibold text-[#64729b]">{file.type}</td>
                    <td className="whitespace-nowrap px-2 py-2 font-semibold text-[#64729b]">{file.size}</td>
                    <td className="whitespace-nowrap px-2 py-2 font-semibold text-[#64729b]">{file.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5">
            <Info size={13} className="shrink-0 text-blue-600" />
            <p className="text-[11px] font-semibold text-[#253261]">
              Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX&nbsp;&nbsp;|&nbsp;&nbsp;Max file size: 10MB
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function DocumentsPage() {
  const [browseOpen, setBrowseOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [docType, setDocType] = useState('')
  const [dateRange, setDateRange] = useState('')
  const [page, setPage] = useState(1)
  const [dragOver, setDragOver] = useState(false)

  const filtered = useMemo(() => DOCS.filter(doc =>
    (!search || doc.name.toLowerCase().includes(search.toLowerCase()) || doc.type.toLowerCase().includes(search.toLowerCase())) &&
    (!category || doc.category === category) &&
    (!docType || doc.type === docType)
  ), [search, category, docType])

  const resetFilters = () => { setSearch(''); setCategory(''); setDocType(''); setDateRange(''); setPage(1) }

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
          <div className="hidden sm:flex items-center gap-4 pt-2">
            <p className="text-xs font-bold text-[#34406f]">Last login: 18 May 2025, 11:25 AM</p>
            <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
              <ShieldCheck size={12} /> Secure Session
            </div>
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
                {STATS.map(stat => {
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
                    placeholder="Search documents by name or type..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-[12px] font-semibold text-slate-800 placeholder-slate-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <select
                  value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={docType} onChange={e => { setDocType(e.target.value); setPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Types</option>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select
                  value={dateRange} onChange={e => setDateRange(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[12px] font-bold text-[#34406f] focus:border-green-500 focus:outline-none"
                >
                  <option value="">All Dates</option>
                  {DATE_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
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
                    {filtered.map(doc => (
                      <tr key={doc.id} className="text-[13px]">
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <FileIcon ext={doc.ext} />
                            <span className="font-bold text-[#253261]">{doc.name}</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${CATEGORY_PILL[doc.category]}`}>
                            {doc.category}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{doc.type}</td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{doc.uploadedOn}</td>
                        <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-[#34406f]">{doc.linkedTo}</td>
                        <td className="whitespace-nowrap px-3 py-3.5">
                          <div className="flex items-center gap-0.5 text-slate-400">
                            <button type="button" title="View" className="rounded p-1.5 hover:bg-slate-50 hover:text-blue-600"><Eye size={15} /></button>
                            <button type="button" title="Download" className="rounded p-1.5 hover:bg-slate-50 hover:text-green-600"><Download size={15} /></button>
                            <button type="button" title="More" className="rounded p-1.5 hover:bg-slate-50"><MoreVertical size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-10 text-center text-sm font-semibold text-[#64729b]">
                          No documents match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-50 pt-4">
                <p className="text-[12px] font-semibold text-[#64729b]">Showing 1 to {filtered.length} of 28 documents</p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n} type="button" onClick={() => setPage(n)}
                      className={`h-8 w-8 rounded-lg text-[12px] font-bold transition-colors ${page === n ? 'bg-blue-600 text-white' : 'border border-slate-200 text-[#34406f] hover:bg-slate-50'}`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button" disabled={page === 4} onClick={() => setPage(p => Math.min(4, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
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
                <Button className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500" leftIcon={<Headset size={14} />}>
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
                onDrop={e => { e.preventDefault(); setDragOver(false); toast.success('File received! (demo)') }}
                className={`flex flex-col items-center rounded-lg border-2 border-dashed px-4 py-7 text-center transition-colors ${dragOver ? 'border-green-500 bg-green-50' : 'border-green-300 bg-green-50/40'}`}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                  <UploadCloud size={20} className="text-green-600" />
                </div>
                <p className="text-[12px] font-bold text-[#253261]">Drag &amp; drop your file here</p>
                <p className="my-1.5 text-[11px] font-semibold text-[#64729b]">or</p>
                <Button size="sm" leftIcon={<FolderOpen size={13} />} onClick={() => setBrowseOpen(true)}>
                  Browse Files
                </Button>
              </div>
              <p className="mt-3 text-[10px] font-semibold leading-relaxed text-[#64729b]">
                Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX<br />Max file size: 10MB
              </p>
            </Card>

            <Card padding="sm" className="rounded-lg">
              <h3 className="mb-3 text-sm font-extrabold text-[#11194f]">Document Categories</h3>
              <div className="space-y-3">
                {SIDEBAR_CATEGORIES.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                        <Icon size={15} className={item.color} />
                      </div>
                      <span className="flex-1 text-[12px] font-bold text-[#253261]">{item.label}</span>
                      <span className="text-[12px] font-extrabold text-[#11194f]">{item.count}</span>
                    </div>
                  )
                })}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full">View All Categories</Button>
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
              <button type="button" className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-green-700 hover:underline">
                Learn more about document security <ArrowRight size={12} />
              </button>
            </Card>
          </aside>
        </div>
      </div>

      <BrowseFilesModal open={browseOpen} onClose={() => setBrowseOpen(false)} />
    </div>
  )
}
