/* Common JS for Cost Estimator pages */
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('estimationForm');
    if (!form) return;

    const totalEstimateElement = document.getElementById('totalEstimate');
    const couponCodeInput = document.getElementById('couponCode');
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponMessage = document.getElementById('couponMessage');
    const discountDisplay = document.getElementById('discountDisplay');
    const discountAmountDisplay = document.getElementById('discountAmountDisplay');
    const appliedDiscountInput = document.getElementById('appliedDiscount');

    const userAuthCheckbox = document.getElementById('userAuth');
    const dailyBackupCheckbox = document.getElementById('dailyBackup');
    const basicDesignCheckbox = document.getElementById('basicDesign');

    let dailyBackupOriginalValue = 2000;
    let basicDesignOriginalValue = 10400;

    if (dailyBackupCheckbox) {
        dailyBackupOriginalValue = parseFloat(dailyBackupCheckbox.value) || 2000;
    }
    if (basicDesignCheckbox) {
        basicDesignOriginalValue = parseFloat(basicDesignCheckbox.value) || 10400;
    }

    let currentDiscountPercentage = 0;

    // Recalculates screen estimate values
    function updateEstimate() {
        let total = 0;

        // Process Checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const val = parseFloat(checkbox.value);
                if (!isNaN(val)) {
                    total += val;
                }
            }
        });

        // Process Selects
        const selects = form.querySelectorAll('select');
        selects.forEach(select => {
            const val = parseFloat(select.value);
            if (!isNaN(val)) {
                total += val;
            }
        });

        let discountedTotal = total;
        let discountAmount = 0;

        if (currentDiscountPercentage > 0) {
            discountAmount = total * (currentDiscountPercentage / 100);
            discountedTotal = total - discountAmount;
            if (discountDisplay) discountDisplay.style.display = 'block';
            if (discountAmountDisplay) discountAmountDisplay.textContent = `₹${discountAmount.toLocaleString('en-IN')}`;
        } else {
            if (discountDisplay) discountDisplay.style.display = 'none';
            if (discountAmountDisplay) discountAmountDisplay.textContent = '₹0';
        }

        if (totalEstimateElement) {
            totalEstimateElement.textContent = `₹${discountedTotal.toLocaleString('en-IN')}`;
        }
        if (appliedDiscountInput) {
            appliedDiscountInput.value = currentDiscountPercentage;
        }
    }

    // Bind Coupon Apply events
    if (applyCouponBtn && couponCodeInput) {
        applyCouponBtn.addEventListener('click', function() {
            const coupon = couponCodeInput.value.trim().toUpperCase();
            if (couponMessage) couponMessage.textContent = '';
            currentDiscountPercentage = 0;

            if (coupon === "EMPL10") {
                currentDiscountPercentage = 10;
                if (couponMessage) {
                    couponMessage.textContent = 'Coupon "EMPL10" applied! You get 10% off.';
                    couponMessage.style.color = 'var(--accent-color)';
                }
            } else if (coupon === "EMPL15") {
                currentDiscountPercentage = 15;
                if (couponMessage) {
                    couponMessage.textContent = 'Coupon "EMPL15" applied! You get 15% off.';
                    couponMessage.style.color = 'var(--accent-color)';
                }
            } else if (coupon === "EMPL20") {
                currentDiscountPercentage = 20;
                if (couponMessage) {
                    couponMessage.textContent = 'Coupon "EMPL20" applied! You get 20% off.';
                    couponMessage.style.color = 'var(--accent-color)';
                }
            } else if (coupon === "EMPL25") {
                currentDiscountPercentage = 25;
                if (couponMessage) {
                    couponMessage.textContent = 'Coupon "EMPL25" applied! You get 25% off.';
                    couponMessage.style.color = 'var(--accent-color)';
                }
            } else if (coupon === "") {
                if (couponMessage) {
                    couponMessage.textContent = 'No coupon applied.';
                    couponMessage.style.color = 'var(--default-color)';
                }
            } else {
                if (couponMessage) {
                    couponMessage.textContent = 'Invalid coupon code.';
                    couponMessage.style.color = 'red';
                }
            }
            updateEstimate();
        });

        couponCodeInput.addEventListener('input', function() {
            const couponVal = couponCodeInput.value.trim().toUpperCase();
            const validCoupons = ["EMPL10", "EMPL15", "EMPL20", "EMPL25"];
            if (currentDiscountPercentage > 0 && !validCoupons.includes(couponVal)) {
                currentDiscountPercentage = 0;
                if (couponMessage) couponMessage.textContent = '';
                updateEstimate();
            }
        });
    }

    // Bind User Auth check conditional values
    if (userAuthCheckbox && dailyBackupCheckbox && basicDesignCheckbox) {
        userAuthCheckbox.addEventListener('change', function() {
            if (this.checked) {
                dailyBackupCheckbox.value = 3000;
                basicDesignCheckbox.value = 15400;
            } else {
                dailyBackupCheckbox.value = dailyBackupOriginalValue;
                basicDesignCheckbox.value = basicDesignOriginalValue;
            }
            updateEstimate();
        });
    }

    // Bind change listener on form elements to auto-update
    form.addEventListener('change', updateEstimate);

    // Dynamic generation of invoice modal on form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Detect if GST is enabled based on form action
        const action = form.getAttribute('action') || '';
        const isGstPage = action.includes('gst.php');

        let subtotal = 0;
        const itemsList = [];

        // Process Checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const val = parseFloat(checkbox.value);
                const labelEl = form.querySelector(`label[for="${checkbox.id}"]`);
                let label = labelEl ? labelEl.textContent.trim() : checkbox.name;
                itemsList.push({ label: label, price: val });
                subtotal += val;
            }
        });

        // Process Selects
        const selects = form.querySelectorAll('select');
        selects.forEach(select => {
            const val = parseFloat(select.value);
            if (select.id === 'additionalProducts' && val === 0) {
                return;
            }
            const labelEl = form.querySelector(`label[for="${select.id}"]`);
            let baseLabel = labelEl ? labelEl.textContent.trim() : select.name;
            baseLabel = baseLabel.split('(')[0].trim();
            const selectedOptionText = select.options[select.selectedIndex].text;
            let label = `${baseLabel}: ${selectedOptionText}`;
            itemsList.push({ label: label, price: val });
            subtotal += val;
        });

        const discountAmount = subtotal * (currentDiscountPercentage / 100);
        const finalTotal = subtotal - discountAmount;

        // Construct Date and ID
        const today = new Date();
        const opt = { day: '2-digit', month: 'short', year: 'numeric' };
        const formattedDate = today.toLocaleDateString('en-GB', opt);
        
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const dateString = today.getFullYear() + String(today.getMonth() + 1).padStart(2, '0') + String(today.getDate()).padStart(2, '0');
        const docId = `B2A-EST-${dateString}-${randomId}`;

        // Create modal overlay element if it doesn't exist yet
        let modal = document.getElementById('quoteModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'quoteModal';
            modal.className = 'quote-modal-overlay';
            modal.style.display = 'none';
            document.body.appendChild(modal);
        }

        let discountRowHtml = '';
        if (currentDiscountPercentage > 0) {
            discountRowHtml = `
                <div class="d-flex justify-content-between mb-2 small text-white-50">
                    <span>Discount (${currentDiscountPercentage}%):</span>
                    <span class="text-danger">-₹${discountAmount.toLocaleString('en-IN')}</span>
                </div>
            `;
        }

        let gstRowHtml = '';
        let grandTotal = finalTotal;
        let totalLabel = 'Total Estimate:';
        if (isGstPage) {
            const gstAmount = finalTotal * 0.18;
            grandTotal = finalTotal + gstAmount;
            totalLabel = 'Grand Total:';
            gstRowHtml = `
                <div class="d-flex justify-content-between mb-2 small text-white-50">
                    <span>GST (18%):</span>
                    <span class="text-white">+₹${gstAmount.toLocaleString('en-IN')}</span>
                </div>
            `;
        }

        let termsAndDisclaimerHtml = '';
        if (isGstPage) {
            termsAndDisclaimerHtml = `
                <div class="disclaimer text-white-50 small mb-4">
                    <p class="mb-1">This is an approximate estimate. Final costs may vary based on detailed requirements and further discussions.</p>
                    <p class="mb-1">All prices are in Indian Rupees (₹).</p>
                    <p class="mb-0">Note: Any feature not mentioned above is not included in the quotation.</p>
                </div>
                <div class="terms-conditions mt-4">
                    <h5 class="text-white text-center mb-3">Terms and Conditions</h5>
                    <ul class="small text-white-50" style="padding-left: 20px;">
                        <li class="mb-2"><strong>Payment Terms:</strong> 50% advance payment required to commence work. The remaining 50% will be split into three installments: 20% upon design approval, 20% upon development completion of core features, and the final 10% upon project completion and before final delivery.</li>
                        <li class="mb-2"><strong>Scope of Work:</strong> Any features or functionalities not explicitly mentioned in this quote will be considered out of scope and may incur additional charges.</li>
                        <li class="mb-2"><strong>Content Responsibility:</strong> Client is responsible for providing all website content (text, images, videos) in a timely manner. Delays in content submission may affect project timelines and potentially incur holding fees.</li>
                        <li class="mb-2"><strong>Revisions:</strong> This quote includes up to 2 rounds of major revisions during the design and development phase. Additional revisions may be subject to extra costs.</li>
                        <li class="mb-2"><strong>Annual Renewals:</strong> Domain registration, hosting, and SSL certificate are valid for one year from the date of setup. Annual renewal charges of ₹15,000 will apply thereafter.</li>
                        <li class="mb-2"><strong>Support:</strong> Email support is provided for basic queries and bug fixes. Dedicated support plans are available for ongoing maintenance and priority assistance.</li>
                        <li class="mb-2"><strong>Validity:</strong> This quotation is valid for 30 days from the date of issue.</li>
                        <li class="mb-2"><strong>Security Measures:</strong> While we implement industry-standard security practices during development, ongoing website security (e.g., regular security audits, vulnerability patching, advanced firewall configurations) beyond the initial setup is the client's responsibility or can be covered under a separate maintenance agreement.</li>
                        <li class="mb-2"><strong>Data Privacy:</strong> Client is responsible for ensuring their website's compliance with all relevant data privacy regulations (e.g., GDPR, CCPA, Indian IT Act) regarding the collection, storage, and processing of user data. We can provide guidance and implement technical features as per explicit requests.</li>
                        <li class="mb-2"><strong>Third-Party Services:</strong> Integration with third-party services (e.g., payment gateways, CRM, marketing tools) is subject to their respective terms and conditions and any associated fees. We are not responsible for the performance or policies of third-party services.</li>
                        <li class="mb-2"><strong>Intellectual Property:</strong> Upon full and final payment, the client will own the intellectual property rights to the custom design and code developed specifically for their project. Any licensed themes, plugins, or stock assets remain subject to their original licenses.</li>
                    </ul>
                </div>
            `;
        } else {
            termsAndDisclaimerHtml = `
                <div class="disclaimer text-white-50 small">
                    <p class="mb-1">This is an approximate estimate. Final costs may vary based on detailed requirements and further discussions.</p>
                    <p class="mb-1">All prices are in Indian Rupees (₹).</p>
                    <p class="mb-0">Note: Any feature not mentioned above is not included in the quotation.</p>
                </div>
            `;
        }

        let tableRowsHtml = '';
        if (itemsList.length === 0) {
            tableRowsHtml = '<tr><td colspan="2" class="text-center">No features selected.</td></tr>';
        } else {
            itemsList.forEach(item => {
                tableRowsHtml += `
                    <tr>
                        <td>${item.label}</td>
                        <td class="text-end">₹${item.price.toLocaleString('en-IN')}</td>
                    </tr>
                `;
            });
        }

        modal.innerHTML = `
            <div class="quote-modal-card">
                <button type="button" class="quote-modal-close-btn" id="closeModalBtn">&times;</button>
                <div class="quote-invoice-container" id="printableInvoice">
                    <div class="invoice-header d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                        <div>
                            <div class="invoice-logo d-flex align-items-center mb-2">
                                <img src="assets/img/logo.png" alt="Base2ace Logo" style="height: 45px; width: 45px; margin-right: 10px;">
                                <span class="fs-3 fw-bold text-white invoice-brand">Base2ace Technologies</span>
                            </div>
                            <p class="text-white-50 small mb-0">ISO 9001:2015 Certified Company</p>
                            <p class="text-white-50 small mb-0">Web Development | Software Development | AI Consultancy | Training</p>
                        </div>
                        <div class="text-end text-md-right invoice-meta-container">
                            <h4 class="text-accent fw-bold text-uppercase tracking-wider fs-5 mb-2">ESTIMATE QUOTE</h4>
                            <p class="mb-1 text-white-50 small">Date: <span class="text-white">${formattedDate}</span></p>
                            <p class="mb-0 text-white-50 small">Doc ID: <span class="text-white">${docId}</span></p>
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-6 mb-3 mb-md-0">
                            <p class="text-accent small mb-1 fw-bold text-uppercase">Prepared By</p>
                            <h5 class="text-white fs-6 mb-1">Base2ace Technologies</h5>
                            <p class="text-white-50 small mb-0">Pune, India</p>
                            <p class="text-white-50 small mb-0">Email: <a href="mailto:info@base2ace.com" class="text-accent text-decoration-none">info@base2ace.com</a></p>
                            <p class="text-white-50 small mb-0">Website: <a href="https://base2ace.com" target="_blank" class="text-accent text-decoration-none">base2ace.com</a></p>
                        </div>
                        <div class="col-md-6 text-md-end text-start">
                            <p class="text-accent small mb-1 fw-bold text-uppercase">Prepared For</p>
                            <h5 class="text-white fs-6 mb-1">Valued Customer</h5>
                            <p class="text-white-50 small mb-0">Estimated Cost Quotation</p>
                        </div>
                    </div>

                    <h5 class="text-white mb-3">Included Features & Details</h5>
                    <div class="table-responsive">
                        <table class="table table-dark table-hover invoice-table">
                            <thead>
                                <tr>
                                    <th scope="col" class="text-white-50 py-2">Feature / Service Description</th>
                                    <th scope="col" class="text-end text-white-50 py-2">Cost (INR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRowsHtml}
                            </tbody>
                        </table>
                    </div>

                    <div class="row justify-content-end mt-4">
                        <div class="col-md-6 text-end">
                            <div class="border-top pt-3">
                                <div class="d-flex justify-content-between mb-2 small text-white-50">
                                    <span>Subtotal:</span>
                                    <span class="text-white font-medium">₹${subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                ${discountRowHtml}
                                ${gstRowHtml}
                                <div class="d-flex justify-content-between mt-3 pt-3 border-top total-amount-highlight">
                                    <span class="fs-5 fw-bold text-accent">${totalLabel}</span>
                                    <span class="fs-4 fw-bold text-accent">₹${grandTotal.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="invoice-terms mt-5 border-top pt-4">
                        ${termsAndDisclaimerHtml}
                    </div>
                </div>

                <div class="d-flex justify-content-center gap-3 mt-4 quote-modal-actions">
                    <button type="button" class="btn btn-primary px-4 py-2" id="printQuoteBtn">
                        <i class="bi bi-printer-fill me-2"></i>Print Estimate / Save as PDF
                    </button>
                    <button type="button" class="btn btn-secondary px-4 py-2" id="closeModalBtn2">Close</button>
                </div>
            </div>
        `;

        // Bind closeModal to close buttons
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }

        document.getElementById('closeModalBtn').addEventListener('click', closeModal);
        document.getElementById('closeModalBtn2').addEventListener('click', closeModal);
        
        // Print Quote logic
        document.getElementById('printQuoteBtn').addEventListener('click', function() {
            window.print();
        });

        // Close on clicking overlay background
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Open modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Run initial verification logic on page load
    updateEstimate();
});
