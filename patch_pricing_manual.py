import re

with open('src/components/PricingModal.tsx', 'r') as f:
    content = f.read()

# Replace PaymentGateways state
content = content.replace("const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'jazzcash' | 'easypaisa'>('stripe');", "const [paymentGateway, setPaymentGateway] = useState<'bank' | 'jazzcash'>('bank');")
content = content.replace("const [mobileNumber, setMobileNumber] = useState('03001234567');", "")
content = content.replace("const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');", "")

# Replace the payment form with the manual details
old_checkout = content[content.find('{/* Gateway Input Fields */}'):content.find('{/* Action buttons */}')]
new_checkout = """{/* Gateway Input Fields */}
              <div className="space-y-4 p-5 rounded-xl bg-slate-50 dark:bg-[#071326] border border-slate-200 dark:border-slate-800">
                <div className="text-sm font-bold text-[#0B1F3A] dark:text-[#D4AF37] mb-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                  Payment Instructions
                </div>
                
                {paymentGateway === 'bank' && (
                  <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>Please transfer exactly <strong>{pricingData[selectedTier].price}</strong> to the following bank account:</p>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs">
                      <div className="mb-1"><span className="text-slate-500">Bank:</span> Bank Alfalah</div>
                      <div><span className="text-slate-500">IBAN / A/C:</span> PK33ALFH0304001005709819</div>
                    </div>
                  </div>
                )}

                {paymentGateway === 'jazzcash' && (
                  <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p>Please transfer exactly <strong>{pricingData[selectedTier].price}</strong> to the following JazzCash account:</p>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-mono text-xs">
                      <div className="mb-1"><span className="text-slate-500">JazzCash Account:</span> {"{{JAZZCASH_NUMBER}}"}</div>
                      <div><span className="text-slate-500">Account Title:</span> {"{{JAZZCASH_TITLE}}"}</div>
                    </div>
                  </div>
                )}

                <div className="pt-3">
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                    After making the payment, please send a screenshot of the receipt via WhatsApp. 
                    Include your registered email address (<strong className="text-slate-800 dark:text-slate-200">{user?.email}</strong>) so we can manually activate your pass.
                  </p>
                  <a 
                    href="https://wa.me/923122421899" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl font-bold text-xs transition-colors"
                  >
                    Send Receipt on WhatsApp
                  </a>
                </div>
              </div>\n\n              """

content = content.replace(old_checkout, new_checkout)

# Find and replace the payment selection buttons
old_gateways = content[content.find('<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">'):content.find('</div>\n              </div>\n\n              {/* Gateway Input Fields */}')]
new_gateways = """<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Bank Transfer */}
                  <button
                    id="btn-gateway-bank"
                    type="button"
                    onClick={() => setPaymentGateway('bank')}
                    className={`p-3 min-h-[44px] rounded-xl border text-left transition-all ${
                      paymentGateway === 'bank'
                        ? 'border-[#0B1F3A] dark:border-[#D4AF37] bg-blue-50/70 dark:bg-[#07172e] ring-2 ring-[#0B1F3A]/20 dark:ring-[#D4AF37]/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-[#071326]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Bank Transfer</div>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Bank Alfalah</div>
                  </button>

                  {/* JazzCash */}
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
                      <div className="font-bold text-xs text-slate-800 dark:text-slate-200">JazzCash</div>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Mobile Wallet</div>
                  </button>
                """

content = content.replace(old_gateways, new_gateways)

# Remove the actual 'Process Payment' / Activate button since it's manual now.
old_process_btn = content[content.find('<div className="w-full sm:w-auto">'):content.find('</button>\n              </div>\n            </div>\n          )}\n\n          {/* Success Step */}')]

# Instead of process, just let them close or mark as pending
new_process_btn = """<div className="w-full sm:w-auto">
                <button
                  id="btn-mark-pending"
                  type="button"
                  onClick={() => {
                    handleClose();
                    alert("Instructions sent! Please ensure you send the receipt on WhatsApp.");
                  }}
                  className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-[#0B1F3A] hover:bg-[#132c4f] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border border-[#D4AF37]/40 active:scale-98"
                >
                  <span>Close Window</span>
                </button>
              </div>"""

content = content.replace(old_process_btn, new_process_btn)

# Ensure CreditCard / Smartphone are not complaining if removed, or keep them. We didn't use them in the new markup anyway.

with open('src/components/PricingModal.tsx', 'w') as f:
    f.write(content)
