import re

file_path = "src/components/PricingModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace state
content = content.replace("useState<'bank' | 'jazzcash'>('bank');", "useState<'bank' | 'whatsapp'>('bank');")

# Replace button
target_button = """                  {/* JazzCash */}
                  <button
                    id="btn-gateway-jazzcash"
                    type="button"
                    onClick={() => setPaymentGateway('jazzcash')}
                    className={`p-3 min-h-[44px] rounded-xl border text-left transition-all ${
                      paymentGateway === 'jazzcash'
                        ? 'border-amber-600 dark:border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-[#071326]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-amber-500" /> JazzCash
                      </div>
                      {paymentGateway === 'jazzcash' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Mobile Wallet</div>
                  </button>"""

replacement_button = """                  {/* WhatsApp Options */}
                  <button
                    id="btn-gateway-whatsapp"
                    type="button"
                    onClick={() => setPaymentGateway('whatsapp')}
                    className={`p-3 min-h-[44px] rounded-xl border text-left transition-all ${
                      paymentGateway === 'whatsapp'
                        ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-[#071326]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-500" /> WhatsApp
                      </div>
                      {paymentGateway === 'whatsapp' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Other Payment Options</div>
                  </button>"""

content = content.replace(target_button, replacement_button)

# Replace instructions
target_instructions = """                {paymentGateway === 'jazzcash' && (
                  <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                    <p>Please transfer exactly <strong className="text-[#0B1F3A] dark:text-white">{currentPricingData[selectedTier].price}</strong> to the following JazzCash account:</p>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm space-y-1">
                      <div className="flex justify-between items-center"><span className="text-slate-500">JazzCash No:</span> <span className="font-bold tracking-wider text-amber-600 dark:text-amber-400">0312-2421899</span></div>
                      <div className="flex justify-between items-center"><span className="text-slate-500">Account Title:</span> <span>[Account Holder Name]</span></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      After payment, enter the <strong>Transaction ID (TID)</strong> below.
                    </p>
                  </div>
                )}"""

replacement_instructions = """                {paymentGateway === 'whatsapp' && (
                  <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
                    <p>For EasyPaisa, SadaPay, Nayapay, or other payment options, please contact us on WhatsApp.</p>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm flex items-center gap-3">
                      <a 
                        href="https://wa.me/923122421899?text=Hi!%20I%20want%20to%20buy%20a%20MUN%20Command%20Center%20pass%20using%20an%20alternative%20payment%20method." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
                      >
                        <Smartphone className="w-4 h-4" /> Message on WhatsApp
                      </a>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      After we process your manual payment, our support team will provide you with a unique access code or upgrade your account directly.
                    </p>
                  </div>
                )}"""

content = content.replace(target_instructions, replacement_instructions)

with open(file_path, "w") as f:
    f.write(content)

print("PricingModal patched successfully.")
