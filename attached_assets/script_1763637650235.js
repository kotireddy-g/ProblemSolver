// Procurement Intelligence Application
class ProcurementApp {
    constructor() {
        this.currentFilter = 'monthly';
        this.isAnimating = false;
        this.charts = {};
        this.syntheticData = this.generateSyntheticData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderMatrix();
        this.updateData();
        
        // Delay chart initialization to ensure DOM is ready
        setTimeout(() => {
            this.initializeCharts();
        }, 100);
        
        this.updateInsights();
        this.showAllSections(); // Ensure all sections are visible on load
    }

    showAllSections() {
        // Make sure all sections are visible by default (except tunnel)
        const actionableItems = document.getElementById('actionableItems');
        const outputsSection = document.querySelector('.outputs-section');
        const kpisSection = document.querySelector('.kpis-section');
        const problemSections = document.querySelector('.problem-identification');
        const trendSection = document.querySelector('.trend-analysis');
        
        if (actionableItems) actionableItems.style.opacity = '1';
        if (outputsSection) outputsSection.style.opacity = '1';
        if (kpisSection) kpisSection.style.opacity = '1';
        if (problemSections) problemSections.style.opacity = '1';
        if (trendSection) trendSection.style.opacity = '1';
    }

    updateData() {
        console.log('Updating data with filter:', this.currentFilter);
        this.updateOutputs();
        this.updateProblemSections();
        this.updateCharts();
        console.log('Data update complete');
    }
    
    updateProblemSections() {
        const data = this.syntheticData[this.currentFilter];
        if (!data) {
            console.error('No data found for filter:', this.currentFilter);
            return;
        }
        
        // Update problem metrics
        const problems = data.problems;
        if (!problems) {
            console.error('No problems data found');
            return;
        }
        const paymentDelayElement = document.getElementById('paymentDelayPercent');
        const avgDelayElement = document.getElementById('avgDelayDays');
        const overConsumptionElement = document.getElementById('overConsumption');
        const wasteAmountElement = document.getElementById('wasteAmount');
        const manualWorkElement = document.getElementById('manualWork');
        const processingTimeElement = document.getElementById('processingTime');
        const vendorChurnElement = document.getElementById('vendorChurn');
        const qualityScoreElement = document.getElementById('qualityScore');
        
        if (paymentDelayElement) paymentDelayElement.textContent = problems.paymentDelayPercent + '%';
        if (avgDelayElement) avgDelayElement.textContent = problems.avgDelayDays;
        if (overConsumptionElement) overConsumptionElement.textContent = problems.overConsumption + '%';
        if (wasteAmountElement) wasteAmountElement.textContent = problems.wasteAmount;
        if (manualWorkElement) manualWorkElement.textContent = problems.manualWork + '%';
        if (processingTimeElement) processingTimeElement.textContent = problems.processingTime;
        if (vendorChurnElement) vendorChurnElement.textContent = problems.vendorChurn + '%';
        if (qualityScoreElement) qualityScoreElement.textContent = problems.qualityScore;
        
        // Update financial impact
        const financial = data.financial;
        const revenueLossCard = document.querySelector('.impact-card.revenue-loss .impact-value');
        const costIncreaseCard = document.querySelector('.impact-card.cost-increase .impact-value');
        const efficiencyLossCard = document.querySelector('.impact-card.efficiency-loss .impact-value');
        
        if (revenueLossCard) revenueLossCard.textContent = financial.revenueLoss;
        if (costIncreaseCard) costIncreaseCard.textContent = financial.costIncrease;
        if (efficiencyLossCard) efficiencyLossCard.textContent = financial.timeWaste;
        
        // Update health score
        const scoreValue = document.querySelector('.score-value');
        const scoreCircle = document.querySelector('.score-circle');
        if (scoreValue) {
            scoreValue.textContent = data.healthScore;
            // Update the conic gradient based on score
            const percentage = (data.healthScore / 100) * 360;
            if (scoreCircle) {
                scoreCircle.style.background = `conic-gradient(from 0deg, #f44336 0deg, #f44336 ${percentage}deg, rgba(255,255,255,0.1) ${percentage}deg)`;
            }
        }
        
        // Update alert banner based on filter
        const alertBanner = document.querySelector('.alert-banner span');
        if (alertBanner) {
            const filterMessages = {
                daily: `${financial.revenueLoss} daily loss detected due to procurement inefficiencies`,
                weekly: `${financial.revenueLoss} weekly loss detected due to procurement inefficiencies`, 
                monthly: `${financial.revenueLoss} monthly loss detected due to procurement inefficiencies`,
                yearly: `${financial.revenueLoss} annual loss detected due to procurement inefficiencies`
            };
            alertBanner.textContent = filterMessages[this.currentFilter] || filterMessages.weekly;
        }
    }

    // Generate synthetic data for all filters
    generateSyntheticData() {
        const categories = [
            'Food & Beverages',
            'Housekeeping',
            'Maintenance',
            'Guest Utilities',
            'Utilities & Supplies',
            'Marketing'
        ];

        const velocities = ['fast-moving', 'medium', 'slow', 'very-slow', 'once-in-a-while'];
        
        const data = {};
        
        ['daily', 'weekly', 'monthly', 'yearly'].forEach(filter => {
            data[filter] = {
                matrix: {},
                outputs: this.generateOutputs(filter),
                problems: this.generateProblems(filter),
                financial: this.generateFinancial(filter),
                healthScore: this.generateHealthScore(filter),
                kpis: this.generateKPIs(filter)
            };

            categories.forEach(category => {
                data[filter].matrix[category] = {};
                velocities.forEach(velocity => {
                    const baseMultiplier = this.getFilterMultiplier(filter);
                    const allocated = Math.floor(Math.random() * 100 * baseMultiplier) + 20;
                    const consumed = Math.floor(allocated * (0.7 + Math.random() * 0.6));
                    const efficiency = (consumed / allocated * 100).toFixed(1);
                    
                    data[filter].matrix[category][velocity] = {
                        allocated,
                        consumed,
                        efficiency: parseFloat(efficiency),
                        status: this.getStatus(efficiency),
                        products: this.generateProductDetails(category, velocity, filter)
                    };
                });
            });
        });

        return data;
    }

    getFilterMultiplier(filter) {
        const multipliers = {
            'daily': 1,
            'weekly': 7,
            'monthly': 30,
            'yearly': 365
        };
        return multipliers[filter] || 1;
    }

    getStatus(efficiency) {
        if (efficiency >= 80 && efficiency <= 100) return 'normal';
        if (efficiency > 100) return 'critical';
        return 'warning';
    }

    generateOutputs(filter) {
        const base = this.getFilterMultiplier(filter);
        return {
            outliers: Math.floor(Math.random() * 15 * base) + 5,
            normal: Math.floor(Math.random() * 50 * base) + 100,
            delayed: Math.floor(Math.random() * 20 * base) + 10,
            exceptions: Math.floor(Math.random() * 8 * base) + 2
        };
    }

    generateKPIs(filter) {
        const points = filter === 'daily' ? 24 : filter === 'weekly' ? 7 : filter === 'monthly' ? 30 : 12;
        
        return {
            utilization: Array.from({length: points}, () => Math.floor(Math.random() * 40) + 60),
            cost: Array.from({length: points}, () => Math.floor(Math.random() * 5000) + 10000),
            wastage: Array.from({length: points}, () => Math.floor(Math.random() * 20) + 5)
        };
    }

    generateProblems(filter) {
        const problems = {
            daily: {
                paymentDelayPercent: 45,
                avgDelayDays: 8.2,
                overConsumption: 28,
                wasteAmount: '₹1.8L',
                manualWork: 82,
                processingTime: 5.8,
                vendorChurn: 22,
                qualityScore: '7.1/10'
            },
            weekly: {
                paymentDelayPercent: 67,
                avgDelayDays: 12.3,
                overConsumption: 34,
                wasteAmount: '₹2.8L',
                manualWork: 79,
                processingTime: 7.2,
                vendorChurn: 31,
                qualityScore: '6.2/10'
            },
            monthly: {
                paymentDelayPercent: 72,
                avgDelayDays: 15.8,
                overConsumption: 41,
                wasteAmount: '₹4.2L',
                manualWork: 76,
                processingTime: 8.5,
                vendorChurn: 38,
                qualityScore: '5.8/10'
            },
            yearly: {
                paymentDelayPercent: 58,
                avgDelayDays: 9.7,
                overConsumption: 29,
                wasteAmount: '₹3.2L',
                manualWork: 81,
                processingTime: 6.8,
                vendorChurn: 26,
                qualityScore: '6.8/10'
            }
        };
        return problems[filter];
    }

    generateFinancial(filter) {
        const financial = {
            daily: {
                revenueLoss: '₹8.2L',
                costIncrease: '+22%',
                timeWaste: '280hrs'
            },
            weekly: {
                revenueLoss: '₹12.4L',
                costIncrease: '+28%',
                timeWaste: '340hrs'
            },
            monthly: {
                revenueLoss: '₹18.6L',
                costIncrease: '+35%',
                timeWaste: '420hrs'
            },
            yearly: {
                revenueLoss: '₹15.2L',
                costIncrease: '+31%',
                timeWaste: '380hrs'
            }
        };
        return financial[filter];
    }

    generateHealthScore(filter) {
        const scores = {
            daily: 42,
            weekly: 34,
            monthly: 28,
            yearly: 38
        };
        return scores[filter];
    }

    generateProductDetails(category, velocity, filter) {
        const products = {
            'Food & Beverages': ['Fresh Vegetables', 'Dairy Products', 'Beverages', 'Meat & Poultry', 'Bakery Items'],
            'Housekeeping': ['Cleaning Supplies', 'Linens', 'Toiletries', 'Room Amenities', 'Laundry Detergents'],
            'Maintenance': ['Tools', 'Spare Parts', 'Electrical Components', 'Plumbing Supplies', 'Safety Equipment'],
            'Guest Utilities': ['Towels', 'Bathrobes', 'Slippers', 'Welcome Kits', 'Room Service Items'],
            'Utilities & Supplies': ['Office Supplies', 'Printing Materials', 'IT Equipment', 'Furniture', 'Lighting'],
            'Marketing': ['Promotional Materials', 'Signage', 'Brochures', 'Digital Assets', 'Event Supplies']
        };

        const categoryProducts = products[category] || ['Generic Items'];
        const selectedProducts = categoryProducts.slice(0, Math.floor(Math.random() * 3) + 2);
        
        return selectedProducts.map(product => ({
            name: product,
            purchaseCycle: this.getPurchaseCycle(velocity, filter),
            quantity: Math.floor(Math.random() * 500) + 100,
            consumption: Math.floor(Math.random() * 400) + 80,
            cost: Math.floor(Math.random() * 10000) + 1000,
            wastage: Math.floor(Math.random() * 15) + 2
        }));
    }

    getPurchaseCycle(velocity, filter) {
        const cycles = {
            'fast-moving': { daily: '2-3 times', weekly: 'Daily', monthly: 'Weekly', yearly: 'Monthly' },
            'medium': { daily: 'Daily', weekly: '2-3 times/week', monthly: 'Bi-weekly', yearly: 'Monthly' },
            'slow': { daily: 'Weekly', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Quarterly' },
            'very-slow': { daily: 'Monthly', weekly: 'Bi-weekly', monthly: 'Quarterly', yearly: 'Bi-annually' },
            'once-in-a-while': { daily: 'Rarely', weekly: 'Monthly', monthly: 'Quarterly', yearly: 'Annually' }
        };
        return cycles[velocity][filter] || 'As needed';
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'active-default');
                });
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.updateAllSections();
                this.updateData();
                this.showFilterTransition();
            });
        });
        
        // Set initial filter state
        this.setInitialFilter();

        // Start button
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startAnimation();
        });

        // Guide button
        document.getElementById('guideBtn').addEventListener('click', () => {
            this.showLearningGuide();
        });

        // Guide close
        document.getElementById('guideClose').addEventListener('click', () => {
            this.hideLearningGuide();
        });
        
        // Close guide when clicking outside
        document.getElementById('learningGuide').addEventListener('click', (e) => {
            if (e.target.id === 'learningGuide') {
                this.hideLearningGuide();
            }
        });
        
        // Close guide with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('learningGuide').classList.contains('active')) {
                this.hideLearningGuide();
            }
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Drawer controls
        document.getElementById('closeDrawer').addEventListener('click', () => {
            this.closeDrawer();
        });

        document.getElementById('drawerOverlay').addEventListener('click', () => {
            this.closeDrawer();
        });
    }

    startAnimation() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const dataFlowContainer = document.getElementById('dataFlowContainer');
        const startBtn = document.getElementById('startBtn');
        
        // Only animate the data flow container, don't hide other sections
        dataFlowContainer.style.display = 'none';
        dataFlowContainer.classList.remove('active');
        
        // Clear any existing particles
        const inputParticles = document.getElementById('dataParticlesInput');
        const tunnelParticles = document.getElementById('tunnelParticles');
        const outputParticles = document.getElementById('dataParticlesOutput');
        if (inputParticles) inputParticles.innerHTML = '';
        if (tunnelParticles) tunnelParticles.innerHTML = '';
        if (outputParticles) outputParticles.innerHTML = '';
        
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        startBtn.disabled = true;
        
        // Show data flow with proper reset
        setTimeout(() => {
            dataFlowContainer.style.display = 'block';
            dataFlowContainer.classList.add('active');
            console.log('Tunnel should now be visible');
            setTimeout(() => {
                this.animateParticles();
                this.animateFunnelStages();
            }, 50);
        }, 200);
        
        // Simulate data processing stages with longer timing
        setTimeout(() => {
            this.fillStructuredData();
        }, 3000);
        
        setTimeout(() => {
            // Hide tunnel after processing and update all data
            dataFlowContainer.style.display = 'none';
            dataFlowContainer.classList.remove('active');
            
            // Update all sections with latest data
            this.updateData();
            this.showAllSections();
            this.updateAllSections(); // Ensure all sections are updated
            
            // Reset button - get fresh reference
            const resetBtn = document.getElementById('startBtn');
            resetBtn.innerHTML = '<i class="fas fa-play"></i> Start Analysis';
            resetBtn.disabled = false;
            this.isAnimating = false;
            
            console.log('Animation complete - all sections updated');
        }, 6500);
    }

    animateParticles() {
        // Start the 3-stage particle flow animation
        this.animateInputParticles();
        setTimeout(() => this.animateTunnelFlow(), 1000);
        setTimeout(() => this.animateOutputParticles(), 2500);
    }

    animateInputParticles() {
        const container = document.getElementById('dataParticlesInput');
        if (!container) return;
        
        // Create different shaped particles
        const shapes = ['circle', 'square', 'triangle', 'diamond'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                particle.className = `particle input particle-${shape}`;
                
                // Random positioning and size
                particle.style.top = (Math.random() * 80 + 10) + '%';
                particle.style.left = '10px';
                particle.style.setProperty('--random-delay', Math.random() * 0.5 + 's');
                particle.style.setProperty('--random-size', (0.6 + Math.random() * 0.8));
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }, i * 150);
        }
    }

    animateTunnelFlow() {
        const container = document.getElementById('tunnelParticles');
        if (!container) return;
        
        // Particles flowing through tunnel - mixed shapes but smaller
        const shapes = ['circle', 'square', 'triangle'];
        
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                particle.className = `particle tunnel particle-${shape}`;
                
                // Random path through tunnel
                particle.style.top = (Math.random() * 60 + 20) + '%';
                particle.style.left = '0%';
                particle.style.setProperty('--flow-speed', (0.8 + Math.random() * 0.4));
                particle.style.setProperty('--spiral-offset', Math.random() * 360 + 'deg');
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 4000);
            }, i * 120);
        }
    }

    animateOutputParticles() {
        const container = document.getElementById('dataParticlesOutput');
        if (!container) return;
        
        // Output particles are uniform - same size circles (processed data)
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle output particle-circle'; // All circles, same size
                
                // Organized positioning for processed data
                particle.style.top = (Math.random() * 70 + 15) + '%';
                particle.style.right = '10px';
                particle.style.setProperty('--emerge-delay', Math.random() * 0.3 + 's');
                particle.style.setProperty('--final-position', Math.random() * 80 + '%');
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }, i * 200);
        }
    }

    fillStructuredData() {
        const dataOutput = document.getElementById('dataParticlesOutput');
        if (dataOutput) {
            dataOutput.innerHTML = '<div class="output-indicator"><i class="fas fa-check"></i></div>';
        }
    }

    showActionableItems() {
        const actionableItems = document.getElementById('actionableItems');
        const dataFlowContainer = document.getElementById('dataFlowContainer');
        
        // Animate matrix filling
        actionableItems.style.opacity = '1';
        actionableItems.classList.add('fade-in-up');
        
        // Animate bubbles appearing one by one
        const bubbles = actionableItems.querySelectorAll('.bubble');
        bubbles.forEach((bubble, index) => {
            setTimeout(() => {
                bubble.style.transform = 'scale(0)';
                bubble.style.animation = 'bubbleAppear 0.6s ease forwards';
                bubble.style.animationDelay = `${index * 0.1}s`;
            }, 100);
        });
        
        // Keep data flow visible longer, then hide with fade
        setTimeout(() => {
            dataFlowContainer.style.opacity = '0';
            setTimeout(() => {
                dataFlowContainer.style.display = 'none';
                dataFlowContainer.style.opacity = '1'; // Reset for next time
            }, 500);
        }, 2000);
    }

    renderMatrix() {
        const matrixBody = document.getElementById('matrixBody');
        const data = this.syntheticData[this.currentFilter];
        if (!data || !data.matrix) {
            console.error('No matrix data found for filter:', this.currentFilter);
            return;
        }
        const categories = Object.keys(data.matrix);
        const velocities = ['fast-moving', 'medium', 'slow', 'very-slow', 'once-in-a-while'];
        
        matrixBody.innerHTML = '';
        let totalItems = 0;
        
        categories.forEach(category => {
            const row = document.createElement('div');
            row.className = 'matrix-row';
            
            const rowHeader = document.createElement('div');
            rowHeader.className = 'row-header';
            rowHeader.textContent = category;
            row.appendChild(rowHeader);
            
            velocities.forEach(velocity => {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                
                const cellData = this.syntheticData[this.currentFilter].matrix[category][velocity];
                if (!cellData) {
                    console.warn(`No data for ${category} - ${velocity}`);
                    return;
                }
                totalItems += cellData.consumed;
                
                const bubble = document.createElement('div');
                bubble.className = `bubble ${cellData.status}`;
                bubble.textContent = cellData.consumed;
                
                const info = document.createElement('div');
                info.className = 'bubble-info';
                info.innerHTML = `Allocated: ${cellData.allocated}<br>Efficiency: ${cellData.efficiency}%`;
                
                cell.appendChild(bubble);
                cell.appendChild(info);
                
                cell.addEventListener('click', () => {
                    this.openDrawer(category, velocity, cellData);
                });
                
                row.appendChild(cell);
            });
            
            matrixBody.appendChild(row);
        });
        
        // Add total items count
        this.updateTotalItemsCount(totalItems);
    }

    updateOutputs() {
        const data = this.syntheticData[this.currentFilter];
        if (!data || !data.outputs) {
            console.error('No outputs data found for filter:', this.currentFilter);
            return;
        }
        
        const outputs = data.outputs;
        
        const outliersEl = document.getElementById('outliersCount');
        const normalEl = document.getElementById('normalCount');
        const delayedEl = document.getElementById('delayedCount');
        const exceptionsEl = document.getElementById('exceptionsCount');
        
        if (outliersEl) outliersEl.textContent = outputs.outliers;
        if (normalEl) normalEl.textContent = outputs.normal;
        if (delayedEl) delayedEl.textContent = outputs.delayed;
        if (exceptionsEl) exceptionsEl.textContent = outputs.exceptions;
        
        // Make output cards visible
        const outputCards = document.querySelectorAll('.output-card');
        outputCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    initializeCharts() {
        this.createCharts();
    }

    createCharts() {
        // Initialize charts object if not exists
        if (!this.charts) {
            this.charts = {};
        }
        
        this.createAllocationChart();
        this.createPaymentChart();
        this.createEfficiencyChart();
        this.createTrendCharts();
    }

    updateCharts() {
        // Destroy existing charts first
        if (this.charts) {
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
        }
        this.charts = {};
        
        // Recreate all charts
        this.createCharts();
    }

    createAllocationChart() {
        const ctx = document.getElementById('allocationChart');
        if (!ctx) {
            console.warn('allocationChart canvas not found');
            return;
        }
        
        // Destroy existing chart if it exists
        if (this.charts.allocationChart) {
            this.charts.allocationChart.destroy();
        }
        
        try {
            this.charts.allocationChart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['F&B', 'Housekeeping', 'Maintenance', 'Guest Supplies', 'Utilities', 'Marketing'],
                datasets: [{
                    label: 'Allocated',
                    data: [100, 100, 100, 100, 100, 100],
                    backgroundColor: 'rgba(76, 175, 80, 0.8)',
                    borderColor: '#4caf50',
                    borderWidth: 1
                }, {
                    label: 'Consumed',
                    data: [134, 98, 112, 89, 105, 94],
                    backgroundColor: 'rgba(244, 67, 54, 0.8)',
                    borderColor: '#f44336',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#b0b0b0' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#b0b0b0' }
                    }
                }
            }
        });
        } catch (error) {
            console.error('Error creating allocation chart:', error);
        }
    }

    createPaymentChart() {
        const ctx = document.getElementById('paymentChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.paymentChart) {
            this.charts.paymentChart.destroy();
        }
        
        this.charts.paymentChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['On-time Payments', 'Delayed Payments'],
                datasets: [{
                    data: [33, 67],
                    backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
                    borderColor: ['#4caf50', '#f44336'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    createEfficiencyChart() {
        const ctx = document.getElementById('efficiencyChart');
        if (!ctx) return;
        
        // Destroy existing chart if it exists
        if (this.charts.efficiencyChart) {
            this.charts.efficiencyChart.destroy();
        }
        
        this.charts.efficiencyChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Automated', 'Manual'],
                datasets: [{
                    data: [21, 79],
                    backgroundColor: ['rgba(100, 255, 218, 0.8)', 'rgba(244, 67, 54, 0.8)'],
                    borderColor: ['#64ffda', '#f44336'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    createTrendCharts() {
        // Payment Delay Trend
        const paymentTrendCtx = document.getElementById('paymentDelayTrend');
        if (paymentTrendCtx) {
            this.charts.paymentDelayTrend = new Chart(paymentTrendCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Payment Delays (%)',
                        data: [46, 52, 58, 61, 65, 67],
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#b0b0b0' }
                        },
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#b0b0b0' }
                        }
                    }
                }
            });
        }

        // Allocation Gap Trend
        const allocationGapCtx = document.getElementById('allocationGapTrend');
        if (allocationGapCtx) {
            this.charts.allocationGapTrend = new Chart(allocationGapCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Over-consumption (%)',
                        data: [18, 22, 26, 29, 32, 34],
                        borderColor: '#ff9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#b0b0b0' }
                        },
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#b0b0b0' }
                        }
                    }
                }
            });
        }

        // Vendor Performance Trend
        const vendorPerfCtx = document.getElementById('vendorPerformanceTrend');
        if (vendorPerfCtx) {
            this.charts.vendorPerformanceTrend = new Chart(vendorPerfCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Quality Score',
                        data: [7.8, 7.4, 7.0, 6.8, 6.5, 6.2],
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                            min: 0,
                            max: 10,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#b0b0b0' }
                        },
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#b0b0b0' }
                        }
                    }
                }
            });
        }
    }

    // Keep the old chart method for backward compatibility
    oldInitializeCharts() {
        const kpis = this.syntheticData[this.currentFilter].kpis;
        
        // Utilization Chart
        this.charts.utilization = new Chart(document.getElementById('utilizationChart'), {
            type: 'line',
            data: {
                labels: this.getChartLabels(),
                datasets: [{
                    label: 'Utilization %',
                    data: kpis.utilization,
                    borderColor: '#64ffda',
                    backgroundColor: 'rgba(100, 255, 218, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });

        // Cost Chart
        this.charts.cost = new Chart(document.getElementById('costChart'), {
            type: 'bar',
            data: {
                labels: this.getChartLabels(),
                datasets: [{
                    label: 'Cost ($)',
                    data: kpis.cost,
                    backgroundColor: 'rgba(0, 188, 212, 0.8)',
                    borderColor: '#00bcd4',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                },
                scales: {
                    x: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { ticks: { color: '#ffffff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });

        // Wastage Chart
        this.charts.wastage = new Chart(document.getElementById('wastageChart'), {
            type: 'doughnut',
            data: {
                labels: ['Acceptable', 'Wastage'],
                datasets: [{
                    data: [85, 15],
                    backgroundColor: ['#4caf50', '#f44336'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#ffffff' }
                    }
                }
            }
        });
    }

    getChartLabels() {
        const labels = {
            'daily': Array.from({length: 24}, (_, i) => `${i}:00`),
            'weekly': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            'monthly': Array.from({length: 30}, (_, i) => `Day ${i + 1}`),
            'yearly': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };
        return labels[this.currentFilter] || [];
    }

    updateAllSections() {
        this.renderMatrix();
        this.updateOutputs();
        this.updateCharts();
        this.updateInsights();
    }

    updateInsights() {
        // Dynamic insights based on current filter and data
        const insights = this.generateInsights();
        // Insights are static in HTML for this prototype
    }

    generateInsights() {
        // Generate dynamic insights based on current data
        return [
            {
                title: 'High Wastage Alert',
                description: 'Food & Beverages showing 15% above normal wastage in fast-moving items.',
                recommendation: 'Implement just-in-time ordering for perishables.'
            }
        ];
    }

    openDrawer(category, velocity, data) {
        const drawer = document.getElementById('detailDrawer');
        const overlay = document.getElementById('drawerOverlay');
        const title = document.getElementById('drawerTitle');
        const content = document.getElementById('drawerContent');
        
        title.textContent = `${category} - ${velocity.replace('-', ' ').toUpperCase()}`;
        
        content.innerHTML = `
            <div class="detail-section">
                <h4>Overview</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Allocated Items</label>
                        <value>${data.allocated}</value>
                    </div>
                    <div class="detail-item">
                        <label>Consumed Items</label>
                        <value>${data.consumed}</value>
                    </div>
                    <div class="detail-item">
                        <label>Efficiency</label>
                        <value>${data.efficiency}%</value>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <value class="${data.status}">${data.status.toUpperCase()}</value>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4>Product Details</h4>
                ${data.products.map(product => `
                    <div class="detail-item" style="margin-bottom: 1rem;">
                        <label>${product.name}</label>
                        <div class="detail-grid" style="margin-top: 0.5rem;">
                            <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 5px;">
                                <small>Purchase Cycle</small><br>
                                <strong>${product.purchaseCycle}</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 5px;">
                                <small>Quantity</small><br>
                                <strong>${product.quantity}</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 5px;">
                                <small>Consumption</small><br>
                                <strong>${product.consumption}</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 5px;">
                                <small>Cost</small><br>
                                <strong>$${product.cost.toLocaleString()}</strong>
                            </div>
                            <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 5px;">
                                <small>Wastage</small><br>
                                <strong>${product.wastage}%</strong>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        overlay.classList.add('active');
        drawer.classList.add('active');
    }

    closeDrawer() {
        const drawer = document.getElementById('detailDrawer');
        const overlay = document.getElementById('drawerOverlay');
        
        overlay.classList.remove('active');
        drawer.classList.remove('active');
    }

    handleSearch(query) {
        // Simple search implementation
        const cells = document.querySelectorAll('.matrix-cell');
        cells.forEach(cell => {
            const text = cell.textContent.toLowerCase();
            if (query && !text.includes(query.toLowerCase())) {
                cell.style.opacity = '0.3';
            } else {
                cell.style.opacity = '1';
            }
        });
    }

    setInitialFilter() {
        // Set monthly as default and remove other active states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active', 'active-default');
        });
        document.querySelector('[data-filter="monthly"]').classList.add('active');
        this.currentFilter = 'monthly';
    }

    showFilterTransition() {
        // Add visual feedback when filter changes
        const actionableItems = document.getElementById('actionableItems');
        actionableItems.style.opacity = '0.5';
        setTimeout(() => {
            actionableItems.style.opacity = '1';
        }, 300);
    }

    animateFunnelStages() {
        const stages = document.querySelectorAll('.stage-label');
        
        // Reset all stages first
        stages.forEach(stage => {
            stage.style.background = 'rgba(100, 255, 218, 0.8)';
            stage.style.transform = 'scale(1)';
            stage.style.boxShadow = 'none';
        });
        
        // Animate stages sequentially
        stages.forEach((stage, index) => {
            setTimeout(() => {
                stage.style.background = 'rgba(100, 255, 218, 1)';
                stage.style.transform = 'scale(1.1)';
                stage.style.boxShadow = '0 0 20px rgba(100, 255, 218, 0.6)';
                setTimeout(() => {
                    stage.style.transform = 'scale(1)';
                }, 400);
            }, index * 800);
        });
    }

    showOutputsAndKPIs() {
        document.querySelector('.outputs-section').style.opacity = '1';
        document.querySelector('.kpis-section').style.opacity = '1';
        
        // Animate output cards
        const outputCards = document.querySelectorAll('.output-card');
        outputCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'translateY(0)';
                card.style.opacity = '1';
            }, index * 150);
        });
    }

    updateTotalItemsCount(totalItems) {
        // Add or update total items display
        let totalDisplay = document.getElementById('totalItemsDisplay');
        if (!totalDisplay) {
            totalDisplay = document.createElement('div');
            totalDisplay.id = 'totalItemsDisplay';
            totalDisplay.className = 'total-items-display';
            document.querySelector('.actionable-items').appendChild(totalDisplay);
        }
        totalDisplay.innerHTML = `<small>Total Items: <strong>${totalItems.toLocaleString()}</strong> | Filter: <strong>${this.currentFilter.charAt(0).toUpperCase() + this.currentFilter.slice(1)}</strong></small>`;
    }

    showLearningGuide() {
        const guide = document.getElementById('learningGuide');
        guide.classList.add('active');
    }

    hideLearningGuide() {
        const guide = document.getElementById('learningGuide');
        guide.classList.remove('active');
    }

    getBubbleSize(value) {
        // Intelligent sizing based on value ranges
        if (value < 100) return 'size-small';
        if (value < 500) return 'size-medium';
        if (value < 1000) return 'size-large';
        return 'size-xlarge';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProcurementApp();
});
