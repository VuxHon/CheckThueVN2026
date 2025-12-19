// Tính VAT từ số tiền có VAT (8%)
// Công thức: VAT = Tổng số tiền (có VAT) - Tổng số tiền (có VAT) / (1 + 8%)
function calculateVATFromTotal(totalWithVAT) {
    if (typeof totalWithVAT === 'string') {
        totalWithVAT = parseInputNumber(totalWithVAT);
    }
    return totalWithVAT - totalWithVAT / (1 + 0.08);
}

// Tính giá trị chưa VAT từ số tiền có VAT (8%)
// Công thức: Giá trị chưa VAT = Tổng số tiền (có VAT) / (1 + 8%)
function calculateValueWithoutVAT(totalWithVAT) {
    if (typeof totalWithVAT === 'string') {
        totalWithVAT = parseInputNumber(totalWithVAT);
    }
    return totalWithVAT / (1 + 0.08);
}

// Format số với dấu chấm cho hiển thị
function formatNumber(num) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(num));
}

// Format số với dấu chấm cho input
function formatInputNumber(value) {
    // Loại bỏ tất cả ký tự không phải số
    const numbers = value.replace(/[^\d]/g, '');
    if (!numbers) return '';
    
    // Format với dấu chấm phân cách hàng nghìn
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse số từ string có dấu chấm
function parseInputNumber(value) {
    return parseFloat(value.replace(/\./g, '')) || 0;
}

// Xử lý format khi nhập
function setupInputFormatting() {
    const revenueInput = document.getElementById('revenue');
    const fixedExpensesInput = document.getElementById('fixedExpenses');
    
    // Format cho các input số lớn (doanh thu và chi phí)
    [revenueInput, fixedExpensesInput].forEach(input => {
        input.addEventListener('input', function(e) {
            const cursorPosition = this.selectionStart;
            const oldValue = this.value;
            const newValue = formatInputNumber(this.value);
            
            this.value = newValue;
            
            // Giữ vị trí con trỏ sau khi format
            const diff = newValue.length - oldValue.length;
            this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
            
            calculate();
        });
        
        // Thêm event listener cho paste
        input.addEventListener('paste', function(e) {
            setTimeout(() => {
                const cursorPosition = this.selectionStart;
                const oldValue = this.value;
                const newValue = formatInputNumber(this.value);
                
                this.value = newValue;
                
                const diff = newValue.length - oldValue.length;
                this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
                
                calculate();
            }, 0);
        });
    });
}

function calculate() {
    // Lấy giá trị đầu vào và parse
    const revenue = parseInputNumber(document.getElementById('revenue').value);
    const taxRate = parseFloat(document.getElementById('taxRate').value.replace(/\./g, '')) || 17;
    const costPercent = parseFloat(document.getElementById('costPercent').value.replace(/\./g, '')) || 0;
    const fixedExpenses = parseInputNumber(document.getElementById('fixedExpenses').value);

    // Tính toán cho Hộ Kinh Doanh (HKD)
    // VAT: 1% theo phương pháp trực tiếp
    const hkdVATRate = 0.01;
    const hkdVATPayable = revenue * hkdVATRate;
    
    // Giá vốn = doanh thu * % giá vốn
    const hkdCost = revenue * (costPercent / 100);
    
    // Chi phí được trừ = chi phí cố định
    const hkdExpenses = fixedExpenses;
    
    // Lợi nhuận tính thuế = Doanh thu - VAT - Giá vốn - Chi phí
    // Theo phương pháp trực tiếp, không trừ VAT đầu vào
    const hkdProfit = revenue - hkdVATPayable - hkdCost - hkdExpenses;
    
    // Thuế TNCN/DN
    const hkdTax = Math.max(0, hkdProfit * (taxRate / 100));
    
    // Tổng thuế
    const hkdTotal = hkdVATPayable + hkdTax;

    // Tính toán cho Doanh Nghiệp (DN)
    // VAT: 8% theo phương pháp khấu trừ
    const dnVATRate = 0.08;
    
    // 1. VAT Đầu Ra = Doanh thu có VAT - Doanh thu có VAT / (1 + 8%)
    const dnVATOutput = calculateVATFromTotal(revenue);
    
    // 2. Doanh thu sau VAT = Doanh thu tổng - VAT Đầu Ra
    // Hoặc: Doanh thu sau VAT = Doanh thu có VAT / (1 + 8%)
    const dnRevenueAfterVAT = calculateValueWithoutVAT(revenue);
    
    // 3. Giá vốn hàng bán (có VAT) = doanh thu * % giá vốn
    const dnCostWithVAT = revenue * (costPercent / 100);
    
    // 4. VAT đầu vào từ Nguyên vật liệu = Giá vốn có VAT - Giá vốn có VAT / (1 + 8%)
    const dnVATInputFromCost = calculateVATFromTotal(dnCostWithVAT);
    
    // 5. Giá vốn hàng bán (chưa VAT) = Giá vốn có VAT / (1 + 8%)
    const dnCost = calculateValueWithoutVAT(dnCostWithVAT);
    
    // 6. Chi phí cố định (có VAT) = fixedExpenses
    // VAT đầu vào từ chi phí = Chi phí có VAT - Chi phí có VAT / (1 + 8%)
    // Giả sử 100% chi phí có VAT 8%
    const dnVATInputFromExpenses = calculateVATFromTotal(fixedExpenses);
    
    // 7. Tổng VAT đầu vào = VAT từ NVL + VAT từ chi phí
    const dnVATInput = dnVATInputFromCost + dnVATInputFromExpenses;
    
    // 8. VAT phải nộp = VAT Đầu Ra - VAT Đầu Vào
    const dnVATPayable = Math.max(0, dnVATOutput - dnVATInput);
    
    // 9. Chi phí được trừ (chưa VAT) = Chi phí có VAT / (1 + 8%)
    // Thêm lương giám đốc 15.5tr/tháng * 12 = 186tr/năm
    const dnExpensesBeforeVAT = calculateValueWithoutVAT(fixedExpenses);
    const directorSalary = 186000000; // 15.5tr * 12
    const dnExpenses = dnExpensesBeforeVAT + directorSalary;
    
    // 10. Lợi nhuận tính thuế = Doanh thu sau VAT - Giá vốn - Chi phí
    const dnProfit = dnRevenueAfterVAT - dnCost - dnExpenses;
    
    // Thuế TNCN/DN
    const dnTax = Math.max(0, dnProfit * (taxRate / 100));
    
    // Tổng thuế
    const dnTotal = dnVATPayable + dnTax;

    // Hiển thị kết quả HKD
    document.getElementById('hkd-revenue').textContent = formatNumber(revenue);
    document.getElementById('hkd-vat-payable').textContent = formatNumber(hkdVATPayable);
    document.getElementById('hkd-cost').textContent = formatNumber(hkdCost);
    document.getElementById('hkd-expenses').textContent = formatNumber(hkdExpenses);
    document.getElementById('hkd-profit').textContent = formatNumber(hkdProfit);
    document.getElementById('hkd-tax-rate').textContent = taxRate + '%';
    document.getElementById('hkd-tax').textContent = formatNumber(hkdTax);
    document.getElementById('hkd-total').textContent = formatNumber(hkdTotal);

    // Hiển thị kết quả DN
    document.getElementById('dn-revenue').textContent = formatNumber(revenue);
    document.getElementById('dn-vat-output').textContent = formatNumber(dnVATOutput);
    document.getElementById('dn-vat-input').textContent = formatNumber(dnVATInput);
    document.getElementById('dn-vat-payable').textContent = formatNumber(dnVATPayable);
    document.getElementById('dn-revenue-after-vat').textContent = formatNumber(dnRevenueAfterVAT);
    document.getElementById('dn-cost').textContent = formatNumber(dnCost);
    document.getElementById('dn-expenses').textContent = formatNumber(dnExpenses);
    document.getElementById('dn-profit').textContent = formatNumber(dnProfit);
    document.getElementById('dn-tax-rate').textContent = taxRate + '%';
    document.getElementById('dn-tax').textContent = formatNumber(dnTax);
    document.getElementById('dn-total').textContent = formatNumber(dnTotal);
}

function reset() {
    document.getElementById('revenue').value = '';
    document.getElementById('taxRate').value = '';
    document.getElementById('costPercent').value = '';
    document.getElementById('fixedExpenses').value = '';
    
    // Reset kết quả
    const resultCells = document.querySelectorAll('.result-table td:last-child');
    resultCells.forEach(cell => {
        cell.textContent = '-';
    });
    
    calculate();
}

// Tự động tính khi nhập liệu
document.addEventListener('DOMContentLoaded', function() {
    // Setup format cho các input số lớn
    setupInputFormatting();
    
    // Tự động tính cho tất cả các input
    const taxRateInput = document.getElementById('taxRate');
    const costPercentInput = document.getElementById('costPercent');
    
    // Thêm event listeners cho tất cả input để tự động tính toán
    [taxRateInput, costPercentInput].forEach(input => {
        input.addEventListener('input', calculate);
        input.addEventListener('paste', function() {
            setTimeout(calculate, 0);
        });
        input.addEventListener('keyup', function(e) {
            // Xử lý khi xóa (Backspace, Delete)
            if (e.key === 'Backspace' || e.key === 'Delete') {
                calculate();
            }
        });
    });
    
    // Tính toán lần đầu
    calculate();
});


