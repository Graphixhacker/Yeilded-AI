import re

header_path = "src/components/Header.tsx"
with open(header_path, "r") as f:
    header = f.read()

# 1. Update imports
header = header.replace("Moon, Sun, Languages } from 'lucide-react';", "Moon, Sun, Languages, Search } from 'lucide-react';\nimport { ROP_DATABASE } from '../data/ropCheatSheet';")

# 2. Add state inside component
state_insertion = """  const [showContextModal, setShowContextModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchResults = searchQuery.trim() 
    ? ROP_DATABASE.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];
"""
header = header.replace("""  const [showContextModal, setShowContextModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);""", state_insertion)

# 3. Add search bar UI
search_ui = """      </div>

      {/* Global Search Bar (Hidden on tiny screens) */}
      <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Rules of Procedure (e.g., Point of Order)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#0B1F3A] dark:focus:ring-[#D4AF37] text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all shadow-inner"
          />
        </div>
        
        {showSearchResults && searchQuery && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)}></div>
            <div className="absolute top-full left-0 mt-3 w-[450px] max-h-[80vh] overflow-y-auto bg-white dark:bg-[#0c1c33] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0c1c33] z-10">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">RoP Toolkit Results</span>
                <button onClick={() => setShowSearchResults(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex flex-col gap-1">
                {searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <div key={result.id} className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-default">
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="text-sm font-bold text-[#0B1F3A] dark:text-[#D4AF37]">{result.title}</h4>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-[#0B1F3A] group-hover:text-white dark:group-hover:bg-[#D4AF37] dark:group-hover:text-[#0B1F3A] transition-colors">{result.category}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">{result.explanation}</p>
                      {result.samplePhrasing && (
                        <div className="mt-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-800/50">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic font-medium">"{result.samplePhrasing}"</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                   <div className="p-6 text-center text-sm text-slate-500">No matching rules found for "{searchQuery}".</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right controls */}"""

header = header.replace("""      </div>

      {/* Right controls */}""", search_ui)

with open(header_path, "w") as f:
    f.write(header)

print("Patch applied.")
