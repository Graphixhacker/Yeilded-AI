import re

file_path = "src/components/PricingModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

target = """                {paymentGateway === 'jazzcash' && (
                  <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>Please transfer exactly <strong className="text-[#0B1F3A] dark:text-white">{currentPricingData[selectedTier].price}</strong> to the following JazzCash account:</p>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm shadow-inner space-y-2">
                      <div className="flex justify-between items-center"><span className="text-slate-500">JazzCash No:</span> <span className="font-bold tracking-wider text-amber-600 dark:text-amber-400">0312-2421899</span></div>
                    </div>
                  </div>
                )}"""

replacement = """                {paymentGateway === 'whatsapp' && (
                  <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>For EasyPaisa, SadaPay, Nayapay, or other payment options, please contact us on WhatsApp.</p>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-sm shadow-inner flex items-center justify-center">
                      <a 
                        href={`https://wa.me/923122421899?text=Hi!%20I%20want%20to%20buy%20a%20MUN%20Command%20Center%20pass%20(${currentPricingData[selectedTier].price}).`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        Message on WhatsApp
                      </a>
                    </div>
                  </div>
                )}"""

content = content.replace(target, replacement)

# We should also adjust the "upload screenshot" text to fit the new context.
target_upload = """                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-3 mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                    <Upload className="w-5 h-5 shrink-0" />
                    <p className="leading-relaxed">
                      After making the payment, send a screenshot of the receipt via WhatsApp. 
                      Include your registered email address (<strong className="font-bold">{user?.email}</strong>) so we can manually activate your pass.
                    </p>
                  </div>"""

replacement_upload = """                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex gap-3 mb-4 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg text-xs border border-amber-200 dark:border-amber-800">
                    <Smartphone className="w-5 h-5 shrink-0" />
                    <p className="leading-relaxed">
                      For manual activation, please send a message on WhatsApp.
                      Include your registered email address (<strong className="font-bold">{user?.email || 'your email'}</strong>) so we can locate and upgrade your account instantly.
                    </p>
                  </div>"""

content = content.replace(target_upload, replacement_upload)

with open(file_path, "w") as f:
    f.write(content)

