// 스마트농업AI협회 웹사이트 메인 JavaScript

console.log('🚀 main.js 로딩 시작');

// ===== 긴급: 즉시 실행 함수 선언 및 전역 등록 =====
// Genspark 환경에서 inline onclick을 위해 즉시 전역 등록
(function() {
    console.log('🔥 즉시 실행: 전역 함수 등록 시작');
    
    // 함수 정의 전이므로 나중에 등록
    // 하지만 선언만 먼저 해둠
    window._kaasaFunctionsReady = false;
})();

// ===== API 설정 =====
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000/api'
  : 'https://kaasa-website.onrender.com/api'; // ✅ Render 배포 URL

console.log('🌐 API Base URL:', API_BASE_URL);

// ===== 인증 헬퍼 함수 =====
function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

function setAuthToken(token, remember = false) {
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
}

function removeAuthToken() {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  sessionStorage.removeItem('currentUser');
}

// 전역 변수
let educationChart = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded 이벤트 발생');
    
    // 즉시 전역 함수 등록 (최우선)
    if (typeof openLoginModal === 'function') {
        window.openLoginModal = openLoginModal;
        console.log('✅ openLoginModal 조기 등록 완료');
    }
    if (typeof openKaasaRegisterModal === 'function') {
        window.openKaasaRegisterModal = openKaasaRegisterModal;
        console.log('✅ openKaasaRegisterModal 조기 등록 완료');
    }
    
    initializeApp();
    loadEducationChart();
    loadMonthlyStats();
    loadSampleData();
});

// 앱 초기화
function initializeApp() {
    // 모바일 메뉴 토글
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 네비게이션 스크롤 효과
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    // 신청서 폼 이벤트
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }

    // 서비스 타입 변경 시 예상 비용 업데이트
    const serviceTypeSelect = document.getElementById('serviceType');
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener('change', updateEstimatedCost);
    }
}

// 섹션으로 스크롤
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 80; // 헤더 높이 고려
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// 모바일 서브메뉴 토글
function toggleMobileSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    if (submenu) {
        submenu.classList.toggle('hidden');
    }
}

// ===== 회원 디렉토리 기능 =====
// TODO: Render API로 마이그레이션 필요

// 회원 검색
async function searchMembers() {
    const keyword = document.getElementById('memberSearchKeyword')?.value?.trim().toLowerCase() || '';
    const industry = document.getElementById('memberIndustry')?.value || '';
    const region = document.getElementById('memberRegion')?.value || '';
    
    try {
        // TODO: Render API로 교체
        // const response = await fetch(`${API_BASE_URL}/admin/members?search=${keyword}&industry=${industry}&region=${region}`);
        // const members = await response.json();
        
        console.warn('회원 디렉토리 기능은 아직 구현되지 않았습니다.');
        showAlert('회원 디렉토리 기능은 준비 중입니다.', 'info');
        return;
        
        /*
        let members = await fetchTableData('members');
        
        // 필터링
        if (industry) {
            members = members.filter(m => m.industry === industry);
        }
        if (region) {
            members = members.filter(m => m.region?.includes(region));
        }
        if (keyword) {
            members = members.filter(m => {
                const name = (m.company_name || '').toLowerCase();
                const ceo = (m.name_kr || '').toLowerCase();
                return name.includes(keyword) || ceo.includes(keyword);
            });
        }
        
        displayMembers(members);
        */
    } catch (error) {
        console.error('회원 검색 오류:', error);
        showAlert('회원 검색 중 오류가 발생했습니다.', 'error');
    }
}

// 회원 목록 표시
function displayMembers(members) {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    if (members.length === 0) {
        membersList.innerHTML = '<p class="col-span-full text-center text-gray-500 py-8">검색 결과가 없습니다.</p>';
        return;
    }
    
    membersList.innerHTML = members.map(member => `
        <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
            <div class="flex items-center mb-4">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <i class="fas fa-building text-blue-600 text-xl"></i>
                </div>
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${member.company_name || '회원사'}</h3>
                    <p class="text-sm text-gray-500">${member.industry || '업종'}</p>
                </div>
            </div>
            <p class="text-gray-600 text-sm mb-4">${member.description || '회원사 소개'}</p>
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${member.region || '지역'}</span>
                <button onclick="viewMemberDetail('${member.id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-blue-700">상세보기</button>
            </div>
        </div>
    `).join('');
}

// 회원 상세보기
function viewMemberDetail(memberId) {
    showAlert('회원 상세정보 기능은 곧 제공될 예정입니다.', 'info');
}

// ===== 프로젝트 매칭 기능 =====

// 프로젝트 등록 모달
function openProjectRegisterModal() {
    if (!currentUser) {
        showAlert('프로젝트 등록은 로그인이 필요합니다.', 'warning');
        openLoginModal();
        return;
    }
    showAlert('프로젝트 등록 기능은 곧 제공될 예정입니다.', 'info');
}

// 진행 중 프로젝트 보기
function viewActiveProjects() {
    scrollToSection('projects');
    showAlert('진행 중인 프로젝트 목록을 확인하세요.', 'info');
}

// 내 프로젝트 보기
function openMyProjects() {
    if (!currentUser) {
        showAlert('로그인이 필요합니다.', 'warning');
        openLoginModal();
        return;
    }
    showAlert('내 프로젝트 관리 기능은 곧 제공될 예정입니다.', 'info');
}

// 교육 차트 로드
function loadEducationChart() {
    const ctx = document.getElementById('educationChart');
    if (!ctx) return;

    if (educationChart) {
        educationChart.destroy();
    }

    const data = {
        labels: ['기초과정', '중급과정', '전문과정', '컨설턴트과정'],
        datasets: [{
            label: '수료자 수',
            data: [856, 542, 324, 167],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(245, 158, 11, 0.8)'
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
                'rgba(139, 92, 246, 1)',
                'rgba(245, 158, 11, 1)'
            ],
            borderWidth: 2
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            family: 'Noto Sans KR'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed * 100) / total).toFixed(1);
                            return `${context.label}: ${context.parsed}명 (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };

    educationChart = new Chart(ctx, config);
}

// 월간 통계 로드
async function loadMonthlyStats() {
    try {
        // 이번 달 신청 현황 로드
        const applications = await fetchTableData('service_applications');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyApplications = applications.filter(app => {
            const appDate = new Date(app.application_date);
            return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
        });

        const completedApplications = monthlyApplications.filter(app => app.status === 'completed');

        // DOM 업데이트
        const monthlyTotalEl = document.getElementById('monthlyTotal');
        const monthlyCompletedEl = document.getElementById('monthlyCompleted');
        
        if (monthlyTotalEl) monthlyTotalEl.textContent = monthlyApplications.length;
        if (monthlyCompletedEl) monthlyCompletedEl.textContent = completedApplications.length;
        
    } catch (error) {
        console.error('월간 통계 로드 오류:', error);
    }
}

// ===== 이전 /tables API 함수들 (더 이상 사용 안 함) =====
// 백엔드가 Render로 이동하여 /api/auth, /api/admin으로 통합됨

/*
// 테이블 데이터 가져오기 (DEPRECATED)
async function fetchTableData(tableName, options = {}) {
    try {
        const { page = 1, limit = 100, search = '', sort = '' } = options;
        let url = `tables/${tableName}?page=${page}&limit=${limit}`;
        
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (sort) url += `&sort=${sort}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error(`테이블 ${tableName} 데이터 가져오기 오류:`, error);
        return [];
    }
}

// 새 레코드 생성 (DEPRECATED)
async function createRecord(tableName, data) {
    try {
        const response = await fetch(`tables/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('레코드 생성 오류:', error);
        throw error;
    }
}

// 레코드 업데이트 (DEPRECATED)
async function updateRecord(tableName, recordId, data) {
    try {
        const response = await fetch(`tables/${tableName}/${recordId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('레코드 업데이트 오류:', error);
        throw error;
    }
}
*/

// ===== 백엔드 API가 이제 Render에 배포되어 있습니다 =====
// 회원 관리는 /api/auth/* 와 /api/admin/* 사용
}

// 신청서 제출 처리
async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // 첨부파일 정보 수집
    const fileInput = document.getElementById('attachmentFile');
    const files = fileInput ? fileInput.files : [];
    const fileInfo = [];
    
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            fileInfo.push({
                name: file.name,
                size: file.size,
                type: file.type
            });
        }
    }
    
    const applicationData = {
        service_type: formData.get('serviceType'),
        applicant_name: formData.get('applicantName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        farm_name: formData.get('farmName'),
        address: formData.get('address'),
        details: formData.get('details'),
        attachments: fileInfo.length > 0 ? JSON.stringify(fileInfo) : null,
        attachment_count: fileInfo.length,
        status: 'pending',
        priority: 'medium',
        application_date: new Date().toISOString(),
        estimated_cost: getEstimatedCost(formData.get('serviceType'))
    };

    // 필수 필드 확인
    if (!applicationData.service_type || !applicationData.applicant_name || !applicationData.phone || !applicationData.email) {
        showAlert('필수 항목을 모두 입력해주세요.', 'error');
        return;
    }

    try {
        const result = await createRecord('service_applications', applicationData);
        
        let message = `신청이 완료되었습니다. 신청번호: ${result.id}`;
        if (fileInfo.length > 0) {
            message += `\n첨부파일 ${fileInfo.length}개가 등록되었습니다.`;
        }
        
        showAlert(message, 'success');
        e.target.reset();
        
        // 파일 목록 초기화
        const fileListDiv = document.getElementById('fileList');
        if (fileListDiv) fileListDiv.innerHTML = '';
        
        updateEstimatedCost(); // 비용 표시 초기화
        loadMonthlyStats(); // 통계 업데이트
    } catch (error) {
        showAlert('신청 처리 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        console.error('신청서 제출 오류:', error);
    }
}

// 예상 비용 계산
function getEstimatedCost(serviceType) {
    const costs = {
        'education': 500000,      // 교육: 50만원
        'design': 2000000,       // 설계: 200만원
        'consulting': 1000000,   // 컨설팅: 100만원
        'monitoring': 3000000,   // 모니터링: 300만원
        'economics': 800000,     // 경제성분석: 80만원
        'commercialization': 1500000 // 기술사업화: 150만원
    };
    
    return costs[serviceType] || 0;
}

// 예상 비용 업데이트 표시 (회원등급 할인 적용)
async function updateEstimatedCost() {
    const serviceTypeSelect = document.getElementById('serviceType');
    const serviceType = serviceTypeSelect ? serviceTypeSelect.value : '';
    
    // 기존 비용 표시 제거
    const existingCostDisplay = document.getElementById('costDisplay');
    if (existingCostDisplay) {
        existingCostDisplay.remove();
    }
    
    if (serviceType && serviceTypeSelect) {
        const originalCost = getEstimatedCost(serviceType);
        
        // 회원 로그인 여부에 따른 할인 계산
        let discountInfo;
        if (currentUser) {
            discountInfo = await calculateDiscount(originalCost, currentUser.member_grade);
        } else {
            discountInfo = { originalPrice: originalCost, discountRate: 0, discountAmount: 0, finalPrice: originalCost };
        }
        
        const costDisplay = document.createElement('div');
        costDisplay.id = 'costDisplay';
        costDisplay.className = 'mt-2 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200';
        
        if (currentUser && discountInfo.discountRate > 0) {
            costDisplay.innerHTML = `
                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">정가:</span>
                        <span class="text-sm text-gray-500 line-through">${discountInfo.originalPrice.toLocaleString()}원</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-green-700">
                            <i class="fas fa-medal mr-1"></i>
                            ${getGradeName(currentUser.member_grade)} 할인 (${discountInfo.discountRate}%):
                        </span>
                        <span class="text-sm text-green-600">-${discountInfo.discountAmount.toLocaleString()}원</span>
                    </div>
                    <div class="border-t border-green-200 pt-2">
                        <div class="flex items-center justify-between">
                            <span class="text-base font-bold text-green-800">최종 가격:</span>
                            <span class="text-lg font-bold text-green-800">${discountInfo.finalPrice.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            costDisplay.innerHTML = `
                <div class="text-center">
                    <div class="flex items-center justify-center text-green-800 mb-2">
                        <i class="fas fa-info-circle mr-2"></i>
                        <span class="text-base font-medium">예상 비용: ${originalCost.toLocaleString()}원</span>
                    </div>
                    ${!currentUser ? `
                        <p class="text-xs text-blue-600">
                            <i class="fas fa-star mr-1"></i>
                            회원가입 시 등급별 할인 혜택을 받을 수 있습니다!
                        </p>
                    ` : ''}
                </div>
            `;
        }
        
        serviceTypeSelect.parentNode.appendChild(costDisplay);
    }
}

// 신청 현황 검색
async function searchApplications() {
    const searchQuery = document.getElementById('searchQuery')?.value?.trim();
    
    if (!searchQuery) {
        showAlert('신청번호 또는 이메일을 입력해주세요.', 'warning');
        return;
    }

    try {
        const applications = await fetchTableData('service_applications', { 
            search: searchQuery 
        });
        
        displaySearchResults(applications);
    } catch (error) {
        console.error('신청 검색 오류:', error);
        showAlert('검색 중 오류가 발생했습니다.', 'error');
    }
}

// 검색 결과 표시
function displaySearchResults(applications) {
    const searchResults = document.getElementById('searchResults');
    const applicationsList = document.getElementById('applicationsList');
    
    if (!searchResults || !applicationsList) return;

    if (applications.length === 0) {
        showAlert('검색 결과가 없습니다.', 'info');
        searchResults.classList.add('hidden');
        return;
    }

    applicationsList.innerHTML = applications.map(app => {
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'in_progress': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };

        const statusTexts = {
            'pending': '대기중',
            'in_progress': '진행중',
            'completed': '완료',
            'cancelled': '취소됨'
        };

        return `
            <div class="p-4 border border-gray-200 rounded-lg">
                <div class="flex justify-between items-start mb-2">
                    <h5 class="font-semibold">${getServiceName(app.service_type)}</h5>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}">
                        ${statusTexts[app.status] || app.status}
                    </span>
                </div>
                <p class="text-sm text-gray-600 mb-1">신청번호: ${app.id}</p>
                <p class="text-sm text-gray-600 mb-1">신청자: ${app.applicant_name}</p>
                <p class="text-sm text-gray-600 mb-1">신청일: ${formatDate(app.application_date)}</p>
                ${app.completion_date ? `<p class="text-sm text-gray-600">완료일: ${formatDate(app.completion_date)}</p>` : ''}
            </div>
        `;
    }).join('');

    searchResults.classList.remove('hidden');
}

// 서비스 이름 가져오기
function getServiceName(serviceType) {
    const serviceNames = {
        'education': '스마트농업 교육',
        'design': '스마트농업 설계',
        'consulting': '현장 컨설팅',
        'monitoring': '데이터AI 모니터링',
        'economics': '경제성 분석',
        'commercialization': '기술사업화'
    };
    
    return serviceNames[serviceType] || serviceType;
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 서비스 모달 열기
function openServiceModal(serviceType) {
    const modal = document.getElementById('serviceModal');
    const title = document.getElementById('serviceModalTitle');
    const content = document.getElementById('serviceModalContent');
    
    if (!modal || !title || !content) return;

    const serviceInfo = getServiceInfo(serviceType);
    title.textContent = serviceInfo.title;
    content.innerHTML = serviceInfo.content;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// 서비스 모달 닫기
function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// 서비스 정보 가져오기
function getServiceInfo(serviceType) {
    const services = {
        'education': {
            title: '스마트농업 교육',
            content: `
                <div class="space-y-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-blue-800 mb-3">교육 과정</h4>
                        <ul class="space-y-2 text-blue-700">
                            <li><i class="fas fa-check mr-2"></i>기초과정: 스마트농업 개념 및 기본 기술 (40시간)</li>
                            <li><i class="fas fa-check mr-2"></i>중급과정: 센서 및 자동화 시스템 활용 (80시간)</li>
                            <li><i class="fas fa-check mr-2"></i>전문과정: AI 기반 농업 솔루션 (120시간)</li>
                        </ul>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-green-800 mb-3">실습 교육</h4>
                        <ul class="space-y-2 text-green-700">
                            <li><i class="fas fa-seedling mr-2"></i>전국 200여 선도농가 연계 현장실습</li>
                            <li><i class="fas fa-tools mr-2"></i>최신 스마트팜 시설 체험</li>
                            <li><i class="fas fa-laptop-code mr-2"></i>ICT 장비 직접 조작 실습</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                            교육 신청하기
                        </button>
                    </div>
                </div>
            `
        },
        'design': {
            title: '스마트농업 설계',
            content: `
                <div class="space-y-6">
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-purple-800 mb-3">설계 서비스</h4>
                        <ul class="space-y-2 text-purple-700">
                            <li><i class="fas fa-compass-drafting mr-2"></i>농장 환경 분석 및 최적화 설계</li>
                            <li><i class="fas fa-microchip mr-2"></i>센서 네트워크 및 자동화 시스템 설계</li>
                            <li><i class="fas fa-chart-line mr-2"></i>데이터 수집 및 분석 시스템 구축</li>
                        </ul>
                    </div>
                    
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-yellow-800 mb-3">투자 계획</h4>
                        <ul class="space-y-2 text-yellow-700">
                            <li><i class="fas fa-calculator mr-2"></i>ROI 기반 투자 우선순위 설정</li>
                            <li><i class="fas fa-won-sign mr-2"></i>단계별 구축 비용 산정</li>
                            <li><i class="fas fa-calendar-alt mr-2"></i>구축 일정 및 로드맵 제공</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition duration-300">
                            설계 신청하기
                        </button>
                    </div>
                </div>
            `
        },
        'consulting': {
            title: '현장 컨설팅',
            content: `
                <div class="space-y-6">
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-green-800 mb-3">컨설팅 영역</h4>
                        <ul class="space-y-2 text-green-700">
                            <li><i class="fas fa-search mr-2"></i>농장 운영 현황 진단 및 분석</li>
                            <li><i class="fas fa-wrench mr-2"></i>시스템 최적화 방안 제시</li>
                            <li><i class="fas fa-graduation-cap mr-2"></i>직원 교육 및 운영 매뉴얼 제공</li>
                        </ul>
                    </div>
                    
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-blue-800 mb-3">지속 지원</h4>
                        <ul class="space-y-2 text-blue-700">
                            <li><i class="fas fa-headset mr-2"></i>24시간 원격 기술 지원</li>
                            <li><i class="fas fa-chart-bar mr-2"></i>정기적인 성과 모니터링</li>
                            <li><i class="fas fa-users mr-2"></i>농장주 네트워킹 지원</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300">
                            컨설팅 신청하기
                        </button>
                    </div>
                </div>
            `
        },
        'monitoring': {
            title: '데이터AI 모니터링',
            content: `
                <div class="space-y-6">
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-indigo-800 mb-3">모니터링 시스템</h4>
                        <ul class="space-y-2 text-indigo-700">
                            <li><i class="fas fa-thermometer-half mr-2"></i>온도, 습도, 조도 실시간 모니터링</li>
                            <li><i class="fas fa-tint mr-2"></i>토양 수분 및 양분 상태 측정</li>
                            <li><i class="fas fa-camera mr-2"></i>영상 기반 생육 상태 관찰</li>
                        </ul>
                    </div>
                    
                    <div class="bg-pink-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-pink-800 mb-3">AI 분석</h4>
                        <ul class="space-y-2 text-pink-700">
                            <li><i class="fas fa-brain mr-2"></i>작물 생육 패턴 AI 분석</li>
                            <li><i class="fas fa-exclamation-triangle mr-2"></i>병충해 조기 감지 및 예측</li>
                            <li><i class="fas fa-chart-line mr-2"></i>수확시기 및 수량 예측</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300">
                            모니터링 신청하기
                        </button>
                    </div>
                </div>
            `
        },
        'economics': {
            title: '경제성 분석',
            content: `
                <div class="space-y-6">
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-yellow-800 mb-3">투자 분석</h4>
                        <ul class="space-y-2 text-yellow-700">
                            <li><i class="fas fa-calculator mr-2"></i>ROI (투자수익률) 정밀 분석</li>
                            <li><i class="fas fa-chart-pie mr-2"></i>NPV (순현재가치) 계산</li>
                            <li><i class="fas fa-balance-scale mr-2"></i>비용-편익 분석 (B/C Ratio)</li>
                        </ul>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-green-800 mb-3">수익성 최적화</h4>
                        <ul class="space-y-2 text-green-700">
                            <li><i class="fas fa-trending-up mr-2"></i>수익 극대화 방안 제시</li>
                            <li><i class="fas fa-cut mr-2"></i>비용 절감 포인트 분석</li>
                            <li><i class="fas fa-clock mr-2"></i>투자회수 기간 단축 전략</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition duration-300">
                            경제성 분석 신청하기
                        </button>
                    </div>
                </div>
            `
        },
        'government': {
            title: '교육·인증 사업',
            content: `
                <div class="space-y-6">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-blue-800 mb-3">
                            <i class="fas fa-graduation-cap mr-2"></i>전문인력 양성 및 교육
                        </h4>
                        <ul class="space-y-2 text-blue-700 text-sm">
                            <li><i class="fas fa-check-circle mr-2"></i>스마트농업 및 AI 관련 전문인력 양성, 교육 및 인증등급제 운영</li>
                            <li><i class="fas fa-check-circle mr-2"></i>스마트농업 전문출판 및 교육콘텐츠, VR·AR·이러닝 등 지식콘텐츠 개발</li>
                            <li><i class="fas fa-check-circle mr-2"></i>청년·여성·사회적경제 기반 농업혁신 교육 프로그램</li>
                        </ul>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-green-800 mb-3">
                            <i class="fas fa-certificate mr-2"></i>교육 특징
                        </h4>
                        <ul class="space-y-2 text-green-700 text-sm">
                            <li><i class="fas fa-users mr-2"></i>연간 2,000명 전문인력 양성 실적</li>
                            <li><i class="fas fa-seedling mr-2"></i>전국 200여 선도농가 연계 현장실습</li>
                            <li><i class="fas fa-award mr-2"></i>인증등급제를 통한 체계적 커리어 관리</li>
                            <li><i class="fas fa-laptop-code mr-2"></i>최신 VR·AR·이러닝 기술 활용</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold">
                            <i class="fas fa-paper-plane mr-2"></i>교육 프로그램 신청하기
                        </button>
                    </div>
                </div>
            `
        },
        'commercialization': {
            title: '경영컨설팅·기술사업화 사업',
            content: `
                <div class="space-y-6">
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-green-800 mb-3">
                            <i class="fas fa-chart-line mr-2"></i>AI·빅데이터 기반 경영컨설팅
                        </h4>
                        <ul class="space-y-2 text-green-700 text-sm">
                            <li><i class="fas fa-check-circle mr-2"></i>AI·빅데이터 기반 경영컨설팅, ROI 분석 및 디지털 진단</li>
                            <li><i class="fas fa-check-circle mr-2"></i>국내외 스마트농업 기술 및 시장조사, 통계분석</li>
                            <li><i class="fas fa-check-circle mr-2"></i>스마트푸드·푸드테크·스마트유통·기후테크 등 연계 산업 지원</li>
                        </ul>
                    </div>
                    
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-blue-800 mb-3">
                            <i class="fas fa-rocket mr-2"></i>기술사업화 및 창업 지원
                        </h4>
                        <ul class="space-y-2 text-blue-700 text-sm">
                            <li><i class="fas fa-check-circle mr-2"></i>기술사업화 및 상용화 지원사업</li>
                            <li><i class="fas fa-check-circle mr-2"></i>스마트농업 창업, 인큐베이팅, 멘토링 및 투자유치 지원</li>
                            <li><i class="fas fa-check-circle mr-2"></i>청년·여성·사회적경제 기반 농업혁신 및 ESG 경영지원</li>
                        </ul>
                    </div>
                    
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-purple-800 mb-3">
                            <i class="fas fa-medal mr-2"></i>컨설팅 특징
                        </h4>
                        <ul class="space-y-2 text-purple-700 text-sm">
                            <li><i class="fas fa-award mr-2"></i>이암허브 1,000여 건 기술가치평가 경험 활용</li>
                            <li><i class="fas fa-database mr-2"></i>AI·빅데이터 기반 정밀 진단 및 분석</li>
                            <li><i class="fas fa-handshake mr-2"></i>정부지원 사업 연계 및 투자유치 지원</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 font-semibold">
                            <i class="fas fa-paper-plane mr-2"></i>컨설팅 신청하기
                        </button>
                    </div>
                </div>
            `
        },
        'policy': {
            title: '연구·기술개발 사업',
            content: `
                <div class="space-y-6">
                    <div class="bg-indigo-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-indigo-800 mb-3">
                            <i class="fas fa-flask mr-2"></i>학술연구 및 기술개발
                        </h4>
                        <ul class="space-y-2 text-indigo-700 text-sm">
                            <li><i class="fas fa-check-circle mr-2"></i>스마트농업 및 AI 관련 학술연구, 기술개발 및 정책연구</li>
                            <li><i class="fas fa-check-circle mr-2"></i>로봇·IoT·센서 등 스마트농업 융합기술 실증 및 상용화 지원</li>
                            <li><i class="fas fa-check-circle mr-2"></i>AI 모델 및 데이터셋의 표준화, 신뢰성 평가, 품질인증 및 디지털트윈 구축</li>
                            <li><i class="fas fa-check-circle mr-2"></i>AI 기반 정책·투자·위험예측 및 지속가능 농업전환 연구</li>
                        </ul>
                    </div>
                    
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-purple-800 mb-3">
                            <i class="fas fa-microscope mr-2"></i>연구 특징
                        </h4>
                        <ul class="space-y-2 text-purple-700 text-sm">
                            <li><i class="fas fa-university mr-2"></i>국내외 연구기관 및 정부기관과의 긴밀한 협력</li>
                            <li><i class="fas fa-robot mr-2"></i>첨단 융합기술 실증 및 상용화 지원</li>
                            <li><i class="fas fa-database mr-2"></i>AI 모델 및 데이터셋 표준화 선도</li>
                            <li><i class="fas fa-leaf mr-2"></i>지속가능한 농업 생태계 조성 연구</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold">
                            <i class="fas fa-paper-plane mr-2"></i>연구 협력 문의하기
                        </button>
                    </div>
                </div>
            `
        },
        'benefits': {
            title: '플랫폼·네트워킹 사업',
            content: `
                <div class="space-y-6">
                    <div class="bg-yellow-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-yellow-800 mb-3">
                            <i class="fas fa-network-wired mr-2"></i>플랫폼 구축 및 운영
                        </h4>
                        <ul class="space-y-2 text-yellow-700 text-sm">
                            <li><i class="fas fa-check-circle mr-2"></i>스마트농업 관련 정보통신업, 데이터플랫폼 및 디지털시스템 구축</li>
                            <li><i class="fas fa-check-circle mr-2"></i>출판, 홍보, 미디어콘텐츠 제작 및 보급</li>
                            <li><i class="fas fa-check-circle mr-2"></i>스마트농업 표준화, 인증제도 및 법제화 관련 제안</li>
                        </ul>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-green-800 mb-3">
                            <i class="fas fa-handshake mr-2"></i>네트워킹 및 교류
                        </h4>
                        <ul class="space-y-2 text-green-700 text-sm">
                            <li><i class="fas fa-check-circle mr-2"></i>문화행사, 전시회, 박람회, 컨벤션, 포럼 및 시상식 개최</li>
                            <li><i class="fas fa-check-circle mr-2"></i>국내외 연구기관·정부·민간단체·국제기구와의 협력 및 교류</li>
                            <li><i class="fas fa-check-circle mr-2"></i>국제개발협력(ODA) 및 글로벌 스마트농업 협력</li>
                            <li><i class="fas fa-check-circle mr-2"></i>스마트농업 및 AI 관련 기술·산업·문화·정책의 융합과 국제협력을 통한 지속가능한 생태계 조성</li>
                        </ul>
                    </div>
                    
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-bold text-lg text-blue-800 mb-3">
                            <i class="fas fa-users mr-2"></i>회원 혜택
                        </h4>
                        <ul class="space-y-2 text-blue-700 text-sm">
                            <li><i class="fas fa-gift mr-2"></i>회원사 간 비즈니스 매칭 및 협력 네트워크</li>
                            <li><i class="fas fa-star mr-2"></i>공동구매 할인, 단체보험, 특별 혜택</li>
                            <li><i class="fas fa-calendar-check mr-2"></i>각종 행사 및 포럼 우선 참가</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="closeServiceModal(); scrollToSection('applications');" class="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition duration-300 font-semibold">
                            <i class="fas fa-paper-plane mr-2"></i>네트워킹 참여하기
                        </button>
                    </div>
                </div>
            `
        }
    };
    
    return services[serviceType] || { title: '서비스 정보', content: '서비스 정보를 불러올 수 없습니다.' };
}

// 전문가 모달 열기
async function openExpertModal() {
    const modal = document.getElementById('expertModal');
    const content = document.getElementById('expertModalContent');
    
    if (!modal || !content) return;

    try {
        const experts = await fetchTableData('experts');
        
        content.innerHTML = `
            <div id="expertsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${displayExperts(experts)}
            </div>
        `;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('전문가 데이터 로드 오류:', error);
        content.innerHTML = '<p class="text-center text-gray-500">전문가 정보를 불러올 수 없습니다.</p>';
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// 전문가 검색 (키워드 + 전문분야)
async function searchExperts() {
    const keyword = document.getElementById('expertKeyword')?.value?.trim().toLowerCase() || '';
    const specialty = document.getElementById('expertSpecialty')?.value || '';
    
    try {
        let experts = await fetchTableData('experts');
        
        // 전문분야 필터링
        if (specialty) {
            experts = experts.filter(expert => expert.specialty === specialty);
        }
        
        // 키워드 필터링 (이름, 회사명, 지역, 전문분야 검색)
        if (keyword) {
            experts = experts.filter(expert => {
                const name = (expert.name || '').toLowerCase();
                const company = (expert.company || '').toLowerCase();
                const location = (expert.location || '').toLowerCase();
                const specialtyName = getSpecialtyName(expert.specialty).toLowerCase();
                
                return name.includes(keyword) || 
                       company.includes(keyword) || 
                       location.includes(keyword) ||
                       specialtyName.includes(keyword);
            });
        }
        
        const content = document.getElementById('expertModalContent');
        if (content) {
            content.innerHTML = `
                <div id="expertsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${experts.length > 0 ? displayExperts(experts) : '<p class="col-span-full text-center text-gray-500 py-8">검색 결과가 없습니다.</p>'}
                </div>
            `;
        }
        
    } catch (error) {
        console.error('전문가 검색 오류:', error);
        showAlert('전문가 검색 중 오류가 발생했습니다.', 'error');
    }
}

// 전문가 모달 닫기
function closeExpertModal() {
    const modal = document.getElementById('expertModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// 전문가 필터링
async function filterExperts() {
    const specialty = document.getElementById('expertSpecialty')?.value;
    const location = document.getElementById('expertLocation')?.value;
    
    try {
        let experts = await fetchTableData('experts');
        
        if (specialty) {
            experts = experts.filter(expert => expert.specialty === specialty);
        }
        
        if (location) {
            experts = experts.filter(expert => expert.location?.includes(location));
        }
        
        const expertsList = document.getElementById('expertsList');
        if (expertsList) {
            expertsList.innerHTML = displayExperts(experts);
        }
        
    } catch (error) {
        console.error('전문가 필터링 오류:', error);
    }
}

// 전문가 목록 표시
function displayExperts(experts) {
    if (experts.length === 0) {
        return '<div class="col-span-full text-center text-gray-500 py-8">검색 조건에 맞는 전문가가 없습니다.</div>';
    }
    
    return experts.map(expert => `
        <div class="bg-white rounded-lg p-6 border border-gray-200 hover:border-green-300 transition duration-300">
            <div class="text-center mb-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-user-tie text-green-600 text-xl"></i>
                </div>
                <h4 class="font-bold text-lg text-gray-800">${expert.name || '전문가'}</h4>
                <p class="text-sm text-gray-600">${getSpecialtyName(expert.specialty)}</p>
            </div>
            
            <div class="space-y-2 text-sm">
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-map-marker-alt w-4 mr-2"></i>
                    <span>${expert.location || '위치 미상'}</span>
                </div>
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-clock w-4 mr-2"></i>
                    <span>경력 ${expert.experience_years || 0}년</span>
                </div>
                <div class="flex items-center text-gray-600">
                    <i class="fas fa-star w-4 mr-2"></i>
                    <span>평점 ${expert.rating || 0}/5</span>
                </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">프로젝트 ${expert.completed_projects || 0}건</span>
                    <span class="px-2 py-1 rounded-full text-xs ${expert.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${expert.availability === 'available' ? '상담가능' : '상담불가'}
                    </span>
                </div>
            </div>
            
            ${expert.availability === 'available' ? 
                '<button onclick="contactExpert(\'' + expert.id + '\')" class="w-full mt-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300">상담 요청</button>' :
                '<button disabled class="w-full mt-3 bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed">상담 불가</button>'
            }
        </div>
    `).join('');
}

// 전문 분야 이름 가져오기
function getSpecialtyName(specialty) {
    const specialtyNames = {
        'smart_farm': '스마트팜 전문가',
        'ict': 'ICT 전문가',
        'economics': '경영분석 전문가',
        'cultivation': '재배 전문가',
        'consulting': '컨설팅 전문가'
    };
    
    return specialtyNames[specialty] || specialty;
}

// 전문가 상담 요청
async function contactExpert(expertId) {
    if (!currentUser) {
        showAlert('전문가 상담 요청은 로그인이 필요합니다.', 'warning');
        closeExpertModal();
        openLoginModal();
        return;
    }
    
    try {
        // 전문가 정보 조회
        const experts = await fetchTableData('experts');
        const expert = experts.find(e => e.id === expertId);
        
        if (!expert) {
            showAlert('전문가 정보를 찾을 수 없습니다.', 'error');
            return;
        }
        
        // 상담 요청 확인
        const confirmed = confirm(`${expert.name} 전문가에게 상담을 요청하시겠습니까?\n\n전문분야: ${getSpecialtyName(expert.specialty)}\n지역: ${expert.location || '미상'}\n경력: ${expert.experience_years || 0}년\n\n상담 요청 후 2-3일 내에 연락드립니다.`);
        
        if (!confirmed) return;
        
        // 상담 요청 데이터 생성
        const consultationRequest = {
            expert_id: expertId,
            expert_name: expert.name,
            requester_id: currentUser.id,
            requester_name: currentUser.name,
            requester_email: currentUser.email,
            requester_phone: currentUser.phone || '',
            request_date: new Date().toISOString(),
            status: 'pending',
            specialty: expert.specialty,
            message: '상담을 요청합니다.'
        };
        
        // 데이터베이스에 저장
        await createRecord('consultation_requests', consultationRequest);
        
        showAlert(`${expert.name} 전문가에게 상담 요청이 완료되었습니다.\n2-3일 내에 연락드리겠습니다.`, 'success');
        
    } catch (error) {
        console.error('상담 요청 오류:', error);
        showAlert('상담 요청 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
}

// ===== 파일 업로드 관리 =====

// 파일 선택 시 파일 목록 표시
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('attachmentFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelection);
    }
});

// 파일 선택 처리
function handleFileSelection(e) {
    const files = e.target.files;
    const fileListDiv = document.getElementById('fileList');
    
    if (!fileListDiv) return;
    
    fileListDiv.innerHTML = '';
    
    if (files.length === 0) return;
    
    // 파일 목록 표시
    Array.from(files).forEach((file, index) => {
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB 단위
        const fileItem = document.createElement('div');
        fileItem.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200';
        fileItem.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-file-${getFileIcon(file.name)} text-blue-600"></i>
                <div>
                    <p class="text-sm font-medium text-gray-800">${file.name}</p>
                    <p class="text-xs text-gray-500">${fileSize} MB</p>
                </div>
            </div>
            <button type="button" onclick="removeFile(${index})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        `;
        fileListDiv.appendChild(fileItem);
    });
}

// 파일 아이콘 결정
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'hwp': 'alt',
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'zip': 'archive'
    };
    return icons[ext] || 'alt';
}

// 파일 제거
function removeFile(index) {
    const fileInput = document.getElementById('attachmentFile');
    if (!fileInput) return;
    
    const dt = new DataTransfer();
    const files = fileInput.files;
    
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    fileInput.files = dt.files;
    handleFileSelection({ target: fileInput });
}

// 신청서 양식 다운로드
function downloadTemplate(type) {
    const templates = {
        'education': {
            name: '교육신청서.docx',
            url: '#' // 실제 파일 URL로 교체 필요
        },
        'consulting': {
            name: '컨설팅신청서.docx',
            url: '#'
        },
        'design': {
            name: '설계신청서.docx',
            url: '#'
        }
    };
    
    const template = templates[type];
    if (!template) {
        showAlert('해당 양식을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // TODO: 실제 파일 다운로드 구현
    // 현재는 알림만 표시
    showAlert(`${template.name} 다운로드 기능은 곧 제공될 예정입니다.`, 'info');
    
    // 실제 다운로드 코드 (파일 URL이 있을 때):
    // const link = document.createElement('a');
    // link.href = template.url;
    // link.download = template.name;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
}

// ===== 수료증 및 인증 기능 (비활성화됨) =====
// 온라인 교육 및 인증 부문이 제거되어 아래 함수들은 주석처리되었습니다.

// 수료증 검색
/*
async function searchCertificate() {
    const certificateNumber = document.getElementById('certificateNumber')?.value?.trim();
    const holderName = document.getElementById('certificateHolderName')?.value?.trim();
    
    if (!certificateNumber && !holderName) {
        showAlert('수료증 번호 또는 성명을 입력해주세요.', 'warning');
        return;
    }

    try {
        let certificates = await fetchTableData('certificates');
        
        if (certificateNumber) {
            certificates = certificates.filter(cert => 
                cert.certificate_number === certificateNumber
            );
        }
        
        if (holderName) {
            certificates = certificates.filter(cert => 
                cert.holder_name?.includes(holderName)
            );
        }
        
        displayCertificateResult(certificates[0]);
        
    } catch (error) {
        console.error('수료증 검색 오류:', error);
        showAlert('수료증 검색 중 오류가 발생했습니다.', 'error');
    }
}

// 수료증 결과 표시
function displayCertificateResult(certificate) {
    const resultDiv = document.getElementById('certificateResult');
    
    if (!resultDiv) return;

    if (!certificate) {
        showAlert('해당하는 수료증을 찾을 수 없습니다.', 'info');
        resultDiv.classList.add('hidden');
        return;
    }

    const statusColors = {
        'active': 'text-green-600',
        'expired': 'text-red-600',
        'revoked': 'text-gray-600'
    };

    const statusTexts = {
        'active': '유효',
        'expired': '만료',
        'revoked': '취소됨'
    };

    resultDiv.innerHTML = `
        <div class="text-center mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-certificate text-green-600 text-2xl"></i>
            </div>
            <h4 class="text-xl font-bold text-gray-800">스마트농업AI협회 수료증</h4>
        </div>
        
        <div class="space-y-3">
            <div class="flex justify-between">
                <span class="font-medium text-gray-700">수료증 번호:</span>
                <span class="text-gray-900">${certificate.certificate_number}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-700">수료자:</span>
                <span class="text-gray-900">${certificate.holder_name}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-700">과정명:</span>
                <span class="text-gray-900">${certificate.course_name}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-700">발급일:</span>
                <span class="text-gray-900">${formatDate(certificate.issue_date)}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-medium text-gray-700">상태:</span>
                <span class="font-semibold ${statusColors[certificate.status] || 'text-gray-600'}">
                    ${statusTexts[certificate.status] || certificate.status}
                </span>
            </div>
            ${certificate.final_score ? `
                <div class="flex justify-between">
                    <span class="font-medium text-gray-700">최종 점수:</span>
                    <span class="text-gray-900">${certificate.final_score}점</span>
                </div>
            ` : ''}
        </div>
        
        ${certificate.digital_url ? `
            <div class="mt-4 text-center">
                <a href="${certificate.digital_url}" target="_blank" class="inline-flex items-center text-green-600 hover:text-green-800">
                    <i class="fas fa-external-link-alt mr-2"></i>
                    디지털 수료증 보기
                </a>
            </div>
        ` : ''}
    `;

    resultDiv.classList.remove('hidden');
}
*/

// 알림 메시지 표시
function showAlert(message, type = 'info') {
    // 기존 알림 제거
    const existingAlert = document.getElementById('customAlert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertColors = {
        'success': 'bg-green-100 border-green-400 text-green-700',
        'error': 'bg-red-100 border-red-400 text-red-700',
        'warning': 'bg-yellow-100 border-yellow-400 text-yellow-700',
        'info': 'bg-blue-100 border-blue-400 text-blue-700'
    };

    const alertIcons = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    };

    const alertDiv = document.createElement('div');
    alertDiv.id = 'customAlert';
    alertDiv.className = `fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg ${alertColors[type] || alertColors.info}`;
    alertDiv.innerHTML = `
        <div class="flex items-center">
            <i class="${alertIcons[type] || alertIcons.info} mr-3"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-lg leading-none">&times;</button>
        </div>
    `;

    document.body.appendChild(alertDiv);

    // 5초 후 자동 제거
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// 샘플 데이터 로드
async function loadSampleData() {
    try {
        // 전문가 샘플 데이터
        const experts = await fetchTableData('experts');
        if (experts.length === 0) {
            const sampleExperts = [
                {
                    name: '김농업',
                    specialty: 'smart_farm',
                    sub_specialty: ['시설원예', '자동화시스템'],
                    experience_years: 15,
                    education: '서울대학교 농생명과학대학',
                    location: '경기도 안성시',
                    availability: 'available',
                    rating: 4.8,
                    completed_projects: 47
                },
                {
                    name: '이기술',
                    specialty: 'ict',
                    sub_specialty: ['IoT', 'AI', '빅데이터'],
                    experience_years: 12,
                    education: 'KAIST 전산학과',
                    location: '서울시 강남구',
                    availability: 'available',
                    rating: 4.9,
                    completed_projects: 62
                },
                {
                    name: '박경영',
                    specialty: 'economics',
                    sub_specialty: ['투자분석', 'ROI분석'],
                    experience_years: 18,
                    education: '연세대학교 경영학과',
                    location: '충남 천안시',
                    availability: 'busy',
                    rating: 4.7,
                    completed_projects: 89
                },
                {
                    name: '최재배',
                    specialty: 'cultivation',
                    sub_specialty: ['토마토재배', '딸기재배', '유기농법'],
                    experience_years: 25,
                    education: '충남대학교 원예학과',
                    location: '충남 논산시',
                    availability: 'available',
                    rating: 4.9,
                    completed_projects: 156
                }
            ];

            for (const expert of sampleExperts) {
                await createRecord('experts', expert);
            }
        }

        // 교육과정 샘플 데이터
        const courses = await fetchTableData('education_courses');
        if (courses.length === 0) {
            const sampleCourses = [
                {
                    course_name: '스마트농업 기초과정',
                    course_level: 'basic',
                    duration_hours: 40,
                    max_participants: 30,
                    instructor: '김농업',
                    description: '스마트농업의 기본 개념과 기초 기술을 배우는 과정',
                    start_date: new Date(Date.now() + 7*24*60*60*1000).toISOString(), // 7일 후
                    end_date: new Date(Date.now() + 14*24*60*60*1000).toISOString(), // 14일 후
                    registration_fee: 500000,
                    status: 'scheduled',
                    location: '스마트농업AI협회 본관'
                },
                {
                    course_name: '스마트농업 전문가과정',
                    course_level: 'advanced',
                    duration_hours: 120,
                    max_participants: 20,
                    instructor: '이기술',
                    description: 'AI와 IoT를 활용한 고급 스마트농업 시스템 구축',
                    start_date: new Date(Date.now() + 30*24*60*60*1000).toISOString(), // 30일 후
                    end_date: new Date(Date.now() + 60*24*60*60*1000).toISOString(), // 60일 후
                    registration_fee: 1500000,
                    status: 'scheduled',
                    location: '스마트농업AI협회 실습동'
                }
            ];

            for (const course of sampleCourses) {
                await createRecord('education_courses', course);
            }
        }

        console.log('샘플 데이터 로드 완료');
    } catch (error) {
        console.error('샘플 데이터 로드 오류:', error);
    }
}

// ===== 비밀번호 해싱 =====

// SHA-256 해시 함수 (브라우저 SubtleCrypto API 사용)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// ===== 회원가입 및 로그인 시스템 =====

// 현재 로그인된 사용자 정보
let currentUser = null;

// 페이지 로드시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    initializeKaasaMemberTypes();
    initializeMemberGrades();
    // loadSampleVideoData(); // 온라인 교육 기능 비활성화됨
    loadBoardPosts();
});

// 로그인 상태 확인 (세션 + 로컬스토리지 모두 지원)
async function checkLoginStatus() {
    const token = getAuthToken();
    
    if (!token) {
        updateUIForLoggedOutUser();
        return;
    }
    
    try {
        // 토큰으로 사용자 정보 조회
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            console.warn('⚠️ 토큰 검증 실패, 로그아웃 처리');
            removeAuthToken();
            updateUIForLoggedOutUser();
            return;
        }
        
        const result = await response.json();
        currentUser = result.member;
        
        // 로컬스토리지에도 업데이트
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        storage.setItem('currentUser', JSON.stringify(result.member));
        
        updateUIForLoggedInUser();
        
    } catch (error) {
        console.error('❌ 로그인 상태 확인 오류:', error);
        
        // 로컬 캐시 사용
        let savedUser = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
        } else {
            updateUIForLoggedOutUser();
        }
    }
}

// 로그인된 사용자 UI 업데이트
function updateUIForLoggedInUser() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const userGrade = document.getElementById('userGrade');
    const loginPrompt = document.getElementById('loginPrompt');
    const videoContent = document.getElementById('videoContent');
    
    if (authButtons) authButtons.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (userName) userName.textContent = currentUser.name || '사용자';
    
    // 회원등급 배지 설정
    if (userGrade) {
        const grade = currentUser.member_grade || 'bronze';
        userGrade.textContent = getGradeName(grade);
        userGrade.className = `px-2 py-1 text-xs rounded-full bg-${grade} text-white`;
    }
    
    // 온라인 교육 섹션 표시
    if (loginPrompt) loginPrompt.classList.add('hidden');
    if (videoContent) {
        videoContent.classList.remove('hidden');
        // loadVideos(); // 온라인 교육 기능 비활성화됨
    }
}

// 로그아웃된 사용자 UI 업데이트
function updateUIForLoggedOutUser() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const loginPrompt = document.getElementById('loginPrompt');
    const videoContent = document.getElementById('videoContent');
    
    if (authButtons) authButtons.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (loginPrompt) loginPrompt.classList.remove('hidden');
    if (videoContent) videoContent.classList.add('hidden');
}

// 회원등급명 가져오기
function getGradeName(gradeCode) {
    const gradeNames = {
        'bronze': 'BRONZE',
        'silver': 'SILVER',
        'gold': 'GOLD',
        'platinum': 'PLATINUM',
        'diamond': 'DIAMOND'
    };
    return gradeNames[gradeCode] || 'BRONZE';
}

// 로그인 모달 열기
function openLoginModal() {
    console.log('📝 openLoginModal 함수 실행됨');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

// 로그인 모달 닫기
function closeLoginModal() {
    console.log('📝 closeLoginModal 함수 실행됨');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// 회원가입 모달 열기
function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        showRegisterStep(1);
    }
}

// 회원가입 모달 닫기
function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// 회원가입 단계 표시
function showRegisterStep(step) {
    const step1 = document.getElementById('registerStep1');
    const step2 = document.getElementById('registerStep2');
    
    if (step === 1) {
        if (step1) step1.classList.remove('hidden');
        if (step2) step2.classList.add('hidden');
    } else if (step === 2) {
        if (step1) step1.classList.add('hidden');
        if (step2) step2.classList.remove('hidden');
    }
}

// 다음 회원가입 단계
function nextRegisterStep() {
    // 1단계 필수 필드 검증
    const required = ['registerName', 'registerPhone', 'registerEmail', 'registerPassword', 'registerPasswordConfirm'];
    let isValid = true;
    
    for (const fieldId of required) {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.classList.add('border-red-500');
            isValid = false;
        } else if (field) {
            field.classList.remove('border-red-500');
        }
    }
    
    // 비밀번호 확인
    const password = document.getElementById('registerPassword')?.value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;
    
    if (password !== passwordConfirm) {
        showAlert('비밀번호가 일치하지 않습니다.', 'error');
        return;
    }
    
    if (password && password.length < 8) {
        showAlert('비밀번호는 8자 이상이어야 합니다.', 'error');
        return;
    }
    
    if (isValid) {
        showRegisterStep(2);
    } else {
        showAlert('필수 항목을 모두 입력해주세요.', 'warning');
    }
}

// 이전 회원가입 단계
function prevRegisterStep() {
    showRegisterStep(1);
}

// 로그인 처리 (기존 members 테이블 기반)
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    if (!email || !password) {
        showAlert('이메일과 비밀번호를 입력해주세요.', 'warning');
        return;
    }
    
    console.log('🔐 로그인 요청:', email);
    
    try {
        // 백엔드 API 호출
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ 로그인 실패:', result);
            showAlert(result.error || '이메일 또는 비밀번호가 올바르지 않습니다.', 'error');
            return;
        }
        
        console.log('✅ 로그인 성공:', result.member);
        
        // JWT 토큰 저장
        setAuthToken(result.token, rememberMe);
        
        // 사용자 정보 저장
        currentUser = result.member;
        if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(result.member));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify(result.member));
        }
        
        updateUIForLoggedInUser();
        closeLoginModal();
        showAlert(`${result.member.name}님, 환영합니다!`, 'success');

    } catch (error) {
        console.error('❌ 로그인 오류:', error);

        if (String(error?.message).includes('Failed to fetch')) {
            showAlert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.', 'error');
        } else {
            showAlert('로그인 중 오류가 발생했습니다.', 'error');
        }
    }
}); // ✅ 여기 한 번만 닫고 끝!

// 회원가입 처리
document.getElementById('registerForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // 알림 설정 배열로 변환
    const notifications = Array.from(document.querySelectorAll('input[name="notifications[]"]:checked'))
        .map(cb => cb.value);
    
    const memberData = {
        email: formData.get('email'),
        password_hash: formData.get('password'), // 실제로는 해시화 필요
        name: formData.get('name'),
        phone: formData.get('phone'),
        birth_date: formData.get('birthDate') ? new Date(formData.get('birthDate')).toISOString() : null,
        gender: formData.get('gender'),
        address: formData.get('address'),
        farm_name: formData.get('farmName'),
        farm_type: formData.get('farmType'),
        experience_years: parseInt(formData.get('experienceYears')) || 0,
        member_grade: 'bronze', // 신규 회원은 브론즈
        total_points: 0,
        join_date: new Date().toISOString(),
        is_verified: false,
        status: 'active',
        notification_preferences: notifications
    };
    
    try {
        const result = await createRecord('members', memberData);
        showAlert('회원가입이 완료되었습니다! 로그인해주세요.', 'success');
        closeRegisterModal();
        openLoginModal();
    } catch (error) {
        console.error('회원가입 오류:', error);
        showAlert('회원가입 중 오류가 발생했습니다.', 'error');
    }
});

// 로그아웃 (세션 + 로컬스토리지 모두 삭제)
function logout() {
    currentUser = null;
    removeAuthToken(); // JWT 토큰 삭제
    updateUIForLoggedOutUser();
    showAlert('로그아웃되었습니다.', 'info');
    
    // 드롭다운 닫기
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.add('hidden');
}

// 사용자 드롭다운 토글
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// ===== 게시판 시스템 =====
let currentBoardFilter = 'all';
let currentBoardPosts = [];

// 게시판 카테고리 필터링
function filterBoard(category) {
    currentBoardFilter = category;
    
    // 탭 버튼 활성화 상태 변경
    document.querySelectorAll('.board-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 게시글 필터링 및 렌더링
    renderBoardPosts();
}

// 게시판 검색
function searchBoard() {
    const searchTerm = document.getElementById('boardSearch').value.toLowerCase();
    renderBoardPosts(searchTerm);
}

// 게시글 렌더링
function renderBoardPosts(searchTerm = '') {
    const filteredPosts = currentBoardPosts.filter(post => {
        const categoryMatch = currentBoardFilter === 'all' || post.category === currentBoardFilter;
        const searchMatch = searchTerm === '' || 
            post.title.toLowerCase().includes(searchTerm) || 
            post.content.toLowerCase().includes(searchTerm);
        return categoryMatch && searchMatch;
    });
    
    // 주요 게시글 렌더링 (최신 3개)
    renderFeaturedPosts(filteredPosts.slice(0, 3));
    
    // 일반 게시글 렌더링
    renderRegularPosts(filteredPosts.slice(3));
}

// 주요 게시글 렌더링
function renderFeaturedPosts(posts) {
    const container = document.getElementById('featuredPosts');
    if (!container) return;
    
    container.innerHTML = posts.map(post => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onclick="openPost('${post.id}')">
            <div class="aspect-video overflow-hidden">
                <img src="${post.featured_image}" alt="${post.title}" class="w-full h-full object-cover">
            </div>
            <div class="p-6">
                <div class="flex items-center justify-between mb-3">
                    <span class="px-3 py-1 text-xs font-medium rounded-full ${getCategoryStyle(post.category)}">
                        ${getCategoryName(post.category)}
                    </span>
                    <span class="text-sm text-gray-500">${formatDate(post.created_at)}</span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-3 line-clamp-2">${post.title}</h3>
                <p class="text-gray-600 line-clamp-3">${post.excerpt}</p>
                <div class="flex items-center mt-4">
                    <img src="${post.author_avatar || '/api/placeholder/32/32'}" alt="${post.author_name}" class="w-8 h-8 rounded-full mr-3">
                    <span class="text-sm text-gray-700">${post.author_name}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 일반 게시글 렌더링
function renderRegularPosts(posts) {
    const container = document.getElementById('regularPosts');
    if (!container) return;
    
    container.innerHTML = posts.map(post => `
        <div class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200" onclick="openPost('${post.id}')">
            <div class="flex">
                <div class="w-48 h-32 flex-shrink-0 overflow-hidden rounded-l-lg">
                    <img src="${post.featured_image}" alt="${post.title}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${getCategoryStyle(post.category)}">
                            ${getCategoryName(post.category)}
                        </span>
                        <span class="text-sm text-gray-500">${formatDate(post.created_at)}</span>
                    </div>
                    <h4 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">${post.title}</h4>
                    <p class="text-gray-600 text-sm line-clamp-2 mb-3">${post.excerpt}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <img src="${post.author_avatar || '/api/placeholder/24/24'}" alt="${post.author_name}" class="w-6 h-6 rounded-full mr-2">
                            <span class="text-sm text-gray-700">${post.author_name}</span>
                        </div>
                        <div class="flex items-center text-gray-400 text-sm">
                            <i class="fas fa-eye mr-1"></i>
                            <span>${post.view_count}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 카테고리 스타일 반환
function getCategoryStyle(category) {
    const styles = {
        'notice': 'bg-red-100 text-red-800',
        'events': 'bg-blue-100 text-blue-800',
        'policy': 'bg-green-100 text-green-800',
        'newsletter': 'bg-purple-100 text-purple-800'
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
}

// 카테고리 이름 반환
function getCategoryName(category) {
    const names = {
        'notice': '공지사항',
        'events': '행사&세미나',
        'policy': '정책연구자료',
        'newsletter': '소식지'
    };
    return names[category] || '기타';
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// 게시글 상세보기
function openPost(postId) {
    const post = currentBoardPosts.find(p => p.id === postId);
    if (!post) return;
    
    // 조회수 증가
    post.view_count += 1;
    
    // 게시글 상세 모달 열기
    openPostDetailModal(post);
}

// 게시글 상세 모달
function openPostDetailModal(post) {
    const modal = document.getElementById('postDetailModal');
    if (!modal) {
        createPostDetailModal();
    }
    
    // 모달 내용 업데이트
    document.getElementById('postDetailTitle').textContent = post.title;
    document.getElementById('postDetailCategory').textContent = getCategoryName(post.category);
    document.getElementById('postDetailCategory').className = `px-3 py-1 text-sm font-medium rounded-full ${getCategoryStyle(post.category)}`;
    document.getElementById('postDetailDate').textContent = formatDate(post.created_at);
    document.getElementById('postDetailAuthor').textContent = post.author_name;
    document.getElementById('postDetailViews').textContent = post.view_count;
    
    // 이미지가 있으면 표시
    const imageContainer = document.getElementById('postDetailImage');
    if (post.featured_image) {
        imageContainer.innerHTML = `<img src="${post.featured_image}" alt="${post.title}" class="w-full rounded-lg mb-6">`;
    } else {
        imageContainer.innerHTML = '';
    }
    
    // 본문 내용
    document.getElementById('postDetailContent').innerHTML = post.content.replace(/\n/g, '<br>');
    
    // 추가 이미지들
    const additionalImages = document.getElementById('postDetailAdditionalImages');
    if (post.additional_images && post.additional_images.length > 0) {
        additionalImages.innerHTML = post.additional_images.map(img => 
            `<img src="${img}" alt="추가 이미지" class="w-full rounded-lg mb-4">`
        ).join('');
    } else {
        additionalImages.innerHTML = '';
    }
    
    // 모달 표시
    document.getElementById('postDetailModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// 게시글 에디터 열기
function openPostEditor() {
    // 관리자 권한 확인
    if (!currentUser || currentUser.member_grade !== 'diamond') {
        showAlert('게시글 작성은 관리자만 가능합니다.', 'warning');
        return;
    }
    
    const modal = document.getElementById('postEditorModal');
    if (!modal) {
        createPostEditorModal();
    }
    
    // 에디터 초기화
    document.getElementById('postEditorForm').reset();
    document.getElementById('postImagePreview').innerHTML = '';
    document.getElementById('additionalImagesPreview').innerHTML = '';
    
    // 모달 표시
    document.getElementById('postEditorModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// 게시판 데이터 로드
async function loadBoardPosts() {
    try {
        // 실제 환경에서는 API에서 데이터를 가져옴
        // const response = await fetch('tables/board_posts');
        // const data = await response.json();
        // currentBoardPosts = data.data;
        
        // 데모용 샘플 데이터
        currentBoardPosts = getSampleBoardPosts();
        renderBoardPosts();
    } catch (error) {
        console.error('게시판 데이터 로드 오류:', error);
    }
}

// 게시판 샘플 데이터 생성
function getSampleBoardPosts() {
    return [
        {
            id: '1',
            title: '2024년 스마트농업 정부지원사업 공지',
            category: 'notice',
            content: '2024년도 농림축산식품부 스마트농업 혁신밸리 조성사업 공모가 시작됩니다.\n\n지원대상: 시·군 단위 지자체\n지원규모: 총 200억원 (개소당 40억원 내외)\n신청기간: 2024년 3월 15일 ~ 4월 30일\n\n자세한 내용은 첨부파일을 참조하시기 바랍니다.',
            excerpt: '2024년도 농림축산식품부 스마트농업 혁신밸리 조성사업 공모가 시작됩니다. 지원규모 총 200억원, 개소당 40억원 내외로 지원됩니다.',
            featured_image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop',
            additional_images: [],
            author_name: '협회 관리자',
            author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
            view_count: 245,
            created_at: '2024-03-01T09:00:00Z',
            is_featured: true,
            tags: ['정부지원', '스마트농업', '공모사업']
        },
        {
            id: '2',
            title: '제15회 스마트농업 국제컨퍼런스 개최 안내',
            category: 'events',
            content: '스마트농업의 미래를 논하는 국제컨퍼런스가 개최됩니다.\n\n일시: 2024년 4월 18일(목) ~ 19일(금)\n장소: 서울 코엑스 컨벤션홀\n주제: "디지털 전환 시대의 지속가능한 농업"\n\n해외 전문가 초청 강연, 최신 기술 전시, 네트워킹 등 다양한 프로그램이 준비되어 있습니다.',
            excerpt: '스마트농업의 미래를 논하는 제15회 국제컨퍼런스가 4월 18일-19일 서울 코엑스에서 개최됩니다.',
            featured_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
            additional_images: [
                'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop',
                'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop'
            ],
            author_name: '이벤트팀',
            author_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=100&h=100&fit=crop&crop=face',
            view_count: 189,
            created_at: '2024-02-28T14:30:00Z',
            is_featured: true,
            tags: ['컨퍼런스', '국제행사', '네트워킹']
        },
        {
            id: '3',
            title: '농업 디지털 전환 정책 연구보고서 발간',
            category: 'policy',
            content: '농업 분야 디지털 전환 정책 방향을 제시하는 연구보고서가 발간되었습니다.\n\n주요 내용:\n- 국내외 농업 디지털화 현황 분석\n- 스마트농업 기술 도입 효과 검증\n- 정책 추진 방향 및 과제\n\n본 보고서는 향후 5년간의 농업 정책 수립에 중요한 기초자료가 될 것입니다.',
            excerpt: '농업 분야 디지털 전환 정책 방향을 제시하는 연구보고서가 발간되었습니다. 향후 5년간의 농업 정책 수립 기초자료로 활용됩니다.',
            featured_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
            additional_images: [],
            author_name: '정책연구팀',
            author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            view_count: 156,
            created_at: '2024-02-25T10:15:00Z',
            is_featured: true,
            tags: ['정책연구', '디지털전환', '보고서']
        },
        {
            id: '4',
            title: '3월호 스마트농업 소식지',
            category: 'newsletter',
            content: '3월호 스마트농업 협회 소식지를 발간했습니다.\n\n주요 내용:\n- 회원사 성공사례: ㈜그린팜의 AI 활용 토마토 재배\n- 정책 동향: 2024년 농업 R&D 예산 증액\n- 기술 트렌드: 농업용 드론의 최신 동향\n- 협회 소식: 신규 회원사 소개\n\n회원 여러분의 많은 관심 부탁드립니다.',
            excerpt: '3월호 스마트농업 협회 소식지가 발간되었습니다. 회원사 성공사례, 정책 동향, 기술 트렌드 등 다양한 정보를 담았습니다.',
            featured_image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=400&fit=crop',
            additional_images: [],
            author_name: '편집부',
            author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
            view_count: 298,
            created_at: '2024-03-01T16:00:00Z',
            is_featured: false,
            tags: ['소식지', '월간지', '협회소식']
        },
        {
            id: '5',
            title: '스마트팜 IoT 센서 설치 워크샵 후기',
            category: 'events',
            content: '지난 2월 20일 개최된 IoT 센서 설치 워크샵이 성공리에 마무리되었습니다.\n\n참석자: 30명 (농업인, 기술자, 학생 등)\n주요 프로그램:\n- IoT 센서 종류별 특징 소개\n- 실습용 센서 설치 및 설정\n- 데이터 수집 및 분석 실습\n\n참가자 만족도 95%로 매우 높은 평가를 받았습니다.',
            excerpt: 'IoT 센서 설치 워크샵이 성공리에 마무리되었습니다. 30명이 참석하여 95%의 높은 만족도를 보였습니다.',
            featured_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
            additional_images: [
                'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=400&fit=crop'
            ],
            author_name: '교육팀',
            author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            view_count: 87,
            created_at: '2024-02-22T11:30:00Z',
            is_featured: false,
            tags: ['워크샵', 'IoT', '실습교육']
        },
        {
            id: '6',
            title: 'AI 기반 작물 병해충 진단 시스템 정책 분석',
            category: 'policy',
            content: 'AI 기술을 활용한 작물 병해충 진단 시스템 도입에 대한 정책 분석 보고서입니다.\n\n현황 분석:\n- 국내 농업 AI 기술 수준\n- 해외 선진사례 분석\n- 농가 도입 장벽 분석\n\n정책 제언:\n- 기술 개발 지원 방안\n- 농가 보급 확대 전략\n- 규제 개선 방향',
            excerpt: 'AI 기반 작물 병해충 진단 시스템 도입을 위한 정책 분석 보고서입니다. 기술 개발 지원과 농가 보급 확대 전략을 제시합니다.',
            featured_image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop',
            additional_images: [],
            author_name: '정책연구팀',
            author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            view_count: 134,
            created_at: '2024-02-20T13:45:00Z',
            is_featured: false,
            tags: ['AI', '병해충', '정책분석']
        }
    ];
}

// 게시글 상세 모달 생성
function createPostDetailModal() {
    const modalHTML = `
        <div id="postDetailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-3">
                                <span id="postDetailCategory" class="px-3 py-1 text-sm font-medium rounded-full"></span>
                                <span id="postDetailDate" class="text-gray-500 text-sm"></span>
                            </div>
                            <h2 id="postDetailTitle" class="text-2xl font-bold text-gray-900 mb-2"></h2>
                            <div class="flex items-center justify-between text-sm text-gray-600">
                                <div class="flex items-center">
                                    <i class="fas fa-user mr-2"></i>
                                    <span id="postDetailAuthor"></span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-eye mr-2"></i>
                                    <span id="postDetailViews"></span>
                                </div>
                            </div>
                        </div>
                        <button onclick="closePostDetailModal()" class="ml-4 p-2 hover:bg-gray-100 rounded-full">
                            <i class="fas fa-times text-gray-500"></i>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <div id="postDetailImage" class="mb-6"></div>
                    <div id="postDetailContent" class="prose max-w-none text-gray-700 leading-relaxed mb-6"></div>
                    <div id="postDetailAdditionalImages"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// 게시글 에디터 모달 생성
function createPostEditorModal() {
    const modalHTML = `
        <div id="postEditorModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-900">게시글 작성</h2>
                        <button onclick="closePostEditorModal()" class="p-2 hover:bg-gray-100 rounded-full">
                            <i class="fas fa-times text-gray-500"></i>
                        </button>
                    </div>
                </div>
                
                <form id="postEditorForm" class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
                            <input type="text" name="title" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                            <select name="category" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                                <option value="">카테고리 선택</option>
                                <option value="notice">공지사항</option>
                                <option value="events">행사&세미나</option>
                                <option value="policy">정책연구자료</option>
                                <option value="newsletter">소식지</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">대표 이미지</label>
                        <input type="file" id="featuredImageInput" name="featuredImage" accept="image/*" onchange="previewFeaturedImage(event)" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <div id="postImagePreview" class="mt-4"></div>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">추가 이미지</label>
                        <input type="file" id="additionalImagesInput" name="additionalImages" accept="image/*" multiple onchange="previewAdditionalImages(event)" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <div id="additionalImagesPreview" class="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4"></div>
                    </div>
                    
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">내용 *</label>
                        <textarea name="content" required rows="12" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="게시글 내용을 입력하세요..."></textarea>
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button type="button" onclick="closePostEditorModal()" class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            취소
                        </button>
                        <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            게시글 등록
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 게시글 작성 폼 이벤트 리스너
    document.getElementById('postEditorForm').addEventListener('submit', handlePostSubmit);
}

// 대표 이미지 미리보기
function previewFeaturedImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('postImagePreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `
                <div class="relative inline-block">
                    <img src="${e.target.result}" alt="미리보기" class="max-w-full h-48 object-cover rounded-lg border">
                    <button type="button" onclick="removeFeaturedImagePreview()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">
                        ×
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}

// 추가 이미지 미리보기
function previewAdditionalImages(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('additionalImagesPreview');
    
    if (files.length > 0) {
        let previewHTML = '';
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewHTML += `
                    <div class="relative">
                        <img src="${e.target.result}" alt="추가 이미지 ${index + 1}" class="w-full h-32 object-cover rounded-lg border">
                        <button type="button" onclick="removeAdditionalImagePreview(${index})" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600">
                            ×
                        </button>
                    </div>
                `;
                
                // 마지막 이미지까지 처리되면 HTML 업데이트
                if (index === files.length - 1) {
                    preview.innerHTML = previewHTML;
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        preview.innerHTML = '';
    }
}

// 대표 이미지 미리보기 제거
function removeFeaturedImagePreview() {
    document.getElementById('featuredImageInput').value = '';
    document.getElementById('postImagePreview').innerHTML = '';
}

// 추가 이미지 미리보기 제거
function removeAdditionalImagePreview(index) {
    const input = document.getElementById('additionalImagesInput');
    const dt = new DataTransfer();
    
    // 선택된 파일에서 해당 인덱스 제외하고 다시 설정
    Array.from(input.files).forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    input.files = dt.files;
    
    // 미리보기 다시 생성
    previewAdditionalImages({ target: input });
}

// 모달 닫기 함수들
function closePostDetailModal() {
    document.getElementById('postDetailModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function closePostEditorModal() {
    document.getElementById('postEditorModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// 게시글 작성 처리
async function handlePostSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newPost = {
        id: Date.now().toString(),
        title: formData.get('title'),
        category: formData.get('category'),
        content: formData.get('content'),
        excerpt: formData.get('content').substring(0, 100) + '...',
        featured_image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=400&fit=crop', // 실제로는 이미지 업로드 처리
        additional_images: [],
        author_name: currentUser.name,
        author_avatar: currentUser.avatar || '/api/placeholder/32/32',
        view_count: 0,
        created_at: new Date().toISOString(),
        is_featured: false,
        tags: []
    };
    
    try {
        // 실제 환경에서는 API로 전송
        // const result = await createRecord('board_posts', newPost);
        
        // 데모용: 로컬 배열에 추가
        currentBoardPosts.unshift(newPost);
        renderBoardPosts();
        closePostEditorModal();
        showAlert('게시글이 등록되었습니다.', 'success');
    } catch (error) {
        console.error('게시글 등록 오류:', error);
        showAlert('게시글 등록 중 오류가 발생했습니다.', 'error');
    }
}

// ===== KAASA 회원가입 시스템 =====

// KAASA 회원가입 모달 열기
function openKaasaRegisterModal() {
    console.log('📝 openKaasaRegisterModal 함수 실행됨');
    const modal = document.getElementById('kaasaRegisterModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        showKaasaStep(1);
        
        // Body 스크롤을 최상단으로 초기화
        const bodyContainer = modal.querySelector('.flex-1.overflow-y-auto');
        if (bodyContainer) {
            bodyContainer.scrollTop = 0;
        }
    }
}

// KAASA 회원가입 모달 닫기
function closeKaasaRegisterModal() {
    console.log('📝 closeKaasaRegisterModal 함수 실행됨');
    const modal = document.getElementById('kaasaRegisterModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// KAASA 회원가입 단계 표시
function showKaasaStep(step) {
    // 모든 단계 숨기기
    for (let i = 1; i <= 6; i++) {
        const stepDiv = document.getElementById(`kaasaStep${i}`);
        if (stepDiv) stepDiv.classList.add('hidden');
    }
    
    // 해당 단계 보이기
    const currentStep = document.getElementById(`kaasaStep${step}`);
    if (currentStep) currentStep.classList.remove('hidden');
    
    // 단계 인디케이터 업데이트
    updateStepIndicators(step);
    
    // Footer 버튼 업데이트 (3단 구조)
    updateFooterButtons(step);
}

// Footer 버튼 업데이트 (3단 구조 전용)
function updateFooterButtons(step) {
    // 모든 footer 버튼 숨기기
    const footerStep1 = document.getElementById('footerStep1');
    const footerStep2 = document.getElementById('footerStep2');
    const footerStep6 = document.getElementById('footerStep6');
    
    if (footerStep1) footerStep1.classList.add('hidden');
    if (footerStep2) footerStep2.classList.add('hidden');
    if (footerStep6) footerStep6.classList.add('hidden');
    
    // 현재 단계에 맞는 footer 버튼 보이기
    if (step === 1) {
        if (footerStep1) footerStep1.classList.remove('hidden');
    } else if (step === 6) {
        if (footerStep6) footerStep6.classList.remove('hidden');
    } else {
        // Step 2, 3, 4, 5
        if (footerStep2) footerStep2.classList.remove('hidden');
    }
}

// 단계 인디케이터 업데이트
function updateStepIndicators(currentStep) {
    for (let i = 1; i <= 6; i++) {
        const indicator = document.getElementById(`step${i}Indicator`);
        const label = indicator?.parentElement?.querySelector('span');
        
        if (indicator && label) {
            if (i < currentStep) {
                // 완료된 단계
                indicator.className = 'w-8 h-8 bg-kaasa-green text-white rounded-full flex items-center justify-center text-sm font-bold';
                indicator.innerHTML = '<i class="fas fa-check"></i>';
                label.className = 'ml-2 text-sm font-medium text-kaasa-green';
            } else if (i === currentStep) {
                // 현재 단계
                indicator.className = 'w-8 h-8 bg-kaasa-green text-white rounded-full flex items-center justify-center text-sm font-bold';
                indicator.textContent = i;
                label.className = 'ml-2 text-sm font-medium text-kaasa-green';
            } else {
                // 미완료 단계
                indicator.className = 'w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-bold';
                indicator.textContent = i;
                label.className = 'ml-2 text-sm font-medium text-gray-500';
            }
        }
    }
}

// 회원 유형 선택
let selectedMemberType = null;

function selectMemberType(memberType) {
    selectedMemberType = memberType;
    
    // 모든 카드의 선택 상태 해제
    document.querySelectorAll('.member-type-card').forEach(card => {
        card.classList.remove('border-kaasa-green', 'bg-green-50');
        card.classList.add('border-gray-200');
        card.querySelector('input[type="radio"]').checked = false;
    });
    
    // 선택된 카드 활성화
    const selectedCard = event.currentTarget;
    selectedCard.classList.remove('border-gray-200');
    selectedCard.classList.add('border-kaasa-green', 'bg-green-50');
    selectedCard.querySelector('input[type="radio"]').checked = true;
    
    // 컨설턴트 회원 선택시 실적연동 회비 안내 표시
    const performanceFeeInfo = document.getElementById('performanceFeeInfo');
    if (['consultant_associate', 'consultant_expert', 'consultant_senior'].includes(memberType)) {
        if (performanceFeeInfo) performanceFeeInfo.classList.remove('hidden');
    } else {
        if (performanceFeeInfo) performanceFeeInfo.classList.add('hidden');
    }
}

// 다음 KAASA 단계
function nextKaasaStep() {
    const currentStep = getCurrentKaasaStep();
    
    if (!validateKaasaStep(currentStep)) {
        return;
    }
    
    if (currentStep === 1) {
        // 2단계로 이동하면서 기업회원 필드 표시/숨김
        showCorporateFields();
    } else if (currentStep === 2) {
        // 3단계는 컨설턴트 회원만
        if (['consultant_associate', 'consultant_expert', 'consultant_senior'].includes(selectedMemberType)) {
            showKaasaStep(3);
        } else {
            showKaasaStep(4); // 일반회원은 4단계로 바로
        }
        return;
    } else if (currentStep === 3) {
        showKaasaStep(4);
        return;
    } else if (currentStep === 4) {
        showKaasaStep(5);
        return;
    } else if (currentStep === 5) {
        showKaasaStep(6);
        updateFeePreview();
        return;
    }
    
    showKaasaStep(currentStep + 1);
}

// 이전 KAASA 단계
function prevKaasaStep() {
    const currentStep = getCurrentKaasaStep();
    
    if (currentStep === 4 && ['consultant_associate', 'consultant_expert', 'consultant_senior'].includes(selectedMemberType)) {
        showKaasaStep(3); // 컨설턴트는 3단계로
    } else if (currentStep === 4 && !['consultant_associate', 'consultant_expert', 'consultant_senior'].includes(selectedMemberType)) {
        showKaasaStep(2); // 일반회원은 2단계로
    } else {
        showKaasaStep(currentStep - 1);
    }
}

// 현재 KAASA 단계 확인
function getCurrentKaasaStep() {
    for (let i = 1; i <= 6; i++) {
        const stepDiv = document.getElementById(`kaasaStep${i}`);
        if (stepDiv && !stepDiv.classList.contains('hidden')) {
            return i;
        }
    }
    return 1;
}

// KAASA 단계 유효성 검사
function validateKaasaStep(step) {
    switch(step) {
        case 1:
            if (!selectedMemberType) {
                showAlert('회원 유형을 선택해주세요.', 'warning');
                return false;
            }
            break;
            
        case 2:
            const requiredFields = ['name_kr', 'birth_date', 'mobile', 'email', 'password', 'password_confirm'];
            
            // 기업회원인 경우에만 business_number 필수
            const corporateFields = document.getElementById('corporateFields');
            const isCorporate = corporateFields && !corporateFields.classList.contains('hidden');
            if (isCorporate) {
                requiredFields.push('business_number');
            }
            
            // 디버그: 누락된 필드 추적
            const missingFields = [];
            
            for (const field of requiredFields) {
                const input = document.querySelector(`#kaasaRegisterForm [name="${field}"]`);
                if (!input) {
                    console.warn(`⚠️ 필드를 찾을 수 없음: ${field}`);
                    missingFields.push(field + ' (DOM 없음)');
                } else if (!input.value.trim()) {
                    input.classList.add('border-red-500');
                    console.warn(`⚠️ 빈 필드: ${field}, 값: "${input.value}"`);
                    missingFields.push(field);
                } else {
                    input.classList.remove('border-red-500');
                    console.log(`✅ 필드 OK: ${field}, 값: "${input.value}"`);
                }
            }
            
            if (missingFields.length > 0) {
                console.error('❌ 누락된 필드:', missingFields);
                showAlert(`필수 항목을 모두 입력해주세요.\n누락: ${missingFields.join(', ')}`, 'warning');
                return false;
            }
            
            // 이메일 형식 검증
            const email = document.querySelector('#kaasaRegisterForm [name="email"]')?.value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                console.error('❌ 이메일 형식 오류:', email);
                showAlert('올바른 이메일 형식을 입력해주세요.', 'error');
                return false;
            }
            
            // 휴대폰 번호 형식 검증
            const mobile = document.querySelector('#kaasaRegisterForm [name="mobile"]')?.value;
            const mobileRegex = /^010-\d{4}-\d{4}$/;
            if (mobile && !mobileRegex.test(mobile)) {
                console.error('❌ 휴대폰 형식 오류:', mobile);
                showAlert('휴대폰 번호는 010-0000-0000 형식으로 입력해주세요.', 'error');
                return false;
            }
            
            // 비밀번호 검증
            const password = document.querySelector('#kaasaRegisterForm [name="password"]')?.value;
            const passwordConfirm = document.querySelector('#kaasaRegisterForm [name="password_confirm"]')?.value;
            const passwordMismatchMsg = document.getElementById('passwordMismatch');
            
            if (password && password.length < 8) {
                console.error('❌ 비밀번호 길이 부족:', password.length);
                showAlert('비밀번호는 최소 8자 이상이어야 합니다.', 'error');
                return false;
            }
            
            if (password !== passwordConfirm) {
                console.error('❌ 비밀번호 불일치:', { password, passwordConfirm });
                if (passwordMismatchMsg) {
                    passwordMismatchMsg.classList.remove('hidden');
                }
                showAlert('비밀번호가 일치하지 않습니다.', 'error');
                return false;
            } else {
                if (passwordMismatchMsg) {
                    passwordMismatchMsg.classList.add('hidden');
                }
            }
            
            console.log('✅ 2단계 검증 통과!');
            break;
            
        case 6:
            const motivation = document.querySelector('[name="motivation"]')?.value;
            const privacyConsent = document.querySelector('[name="privacy_consent"]')?.checked;
            
            if (!motivation || motivation.length < 50) {
                showAlert('가입동기를 50자 이상 작성해주세요.', 'warning');
                return false;
            }
            
            if (!privacyConsent) {
                showAlert('개인정보 수집·이용에 동의해주세요.', 'warning');
                return false;
            }
            break;
    }
    
    return true;
}

// 기업회원 필드 표시/숨김
function showCorporateFields() {
    const corporateFields = document.getElementById('corporateFields');
    if (corporateFields) {
        const isCorporate = ['corporate', 'midsize_corporate', 'large_corporate'].includes(selectedMemberType);
        if (isCorporate) {
            corporateFields.classList.remove('hidden');
            const businessInput = corporateFields.querySelector('[name="business_number"]');
            if (businessInput) businessInput.required = true;
        } else {
            corporateFields.classList.add('hidden');
            const businessInput = corporateFields.querySelector('[name="business_number"]');
            if (businessInput) businessInput.required = false;
        }
    }
}

// 자격증 추가
function addCertification() {
    const container = document.getElementById('certifications');
    if (!container) return;
    
    const certCount = container.querySelectorAll('.certification-item').length;
    if (certCount >= 3) {
        showAlert('자격증은 최대 3개까지 입력 가능합니다.', 'warning');
        return;
    }
    
    const newCert = document.createElement('div');
    newCert.className = 'certification-item grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg';
    newCert.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">자격증명</label>
            <input type="text" name="cert_name_${certCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="스마트팜 관리사">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">발급기관</label>
            <input type="text" name="cert_issuer_${certCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="농림축산식품부">
        </div>
        <div class="flex items-end">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">취득일</label>
                <input type="date" name="cert_date_${certCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green">
            </div>
            <button type="button" onclick="removeCertification(this)" class="ml-2 text-red-500 hover:text-red-700 p-2">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(newCert);
}

// 자격증 제거
function removeCertification(button) {
    const certItem = button.closest('.certification-item');
    if (certItem) {
        certItem.remove();
    }
}

// 학위 추가
function addDegree() {
    const container = document.getElementById('degrees');
    if (!container) return;
    
    const degreeCount = container.querySelectorAll('.degree-item').length;
    if (degreeCount >= 3) {
        showAlert('학위는 최대 3개까지 입력 가능합니다.', 'warning');
        return;
    }
    
    const newDegree = document.createElement('div');
    newDegree.className = 'degree-item grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg';
    newDegree.innerHTML = `
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">학위명</label>
            <input type="text" name="degree_name_${degreeCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="농업공학 석사">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">전공</label>
            <input type="text" name="degree_major_${degreeCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="스마트팜 시스템">
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">대학교</label>
            <input type="text" name="degree_university_${degreeCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="서울대학교">
        </div>
        <div class="flex items-end">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">졸업연도</label>
                <input type="number" name="degree_year_${degreeCount + 1}" min="1950" max="2030" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="2020">
            </div>
            <button type="button" onclick="removeDegree(this)" class="ml-2 text-red-500 hover:text-red-700 p-2">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(newDegree);
}

// 학위 제거
function removeDegree(button) {
    const degreeItem = button.closest('.degree-item');
    if (degreeItem) {
        degreeItem.remove();
    }
}

// 프로젝트 추가
function addProject() {
    const container = document.getElementById('projects');
    if (!container) return;
    
    const projectCount = container.querySelectorAll('.project-item').length;
    if (projectCount >= 3) {
        showAlert('프로젝트는 최대 3개까지 입력 가능합니다.', 'warning');
        return;
    }
    
    const newProject = document.createElement('div');
    newProject.className = 'project-item p-4 border border-gray-200 rounded-lg';
    newProject.innerHTML = `
        <div class="flex justify-end mb-2">
            <button type="button" onclick="removeProject(this)" class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">프로젝트명</label>
                <input type="text" name="project_name_${projectCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="스마트팜 AI 시스템 구축">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">수행기간</label>
                <input type="text" name="project_period_${projectCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="2022.01 ~ 2022.12">
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">역할</label>
                <input type="text" name="project_role_${projectCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="PM">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">클라이언트</label>
                <input type="text" name="project_client_${projectCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="농협중앙회">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">예산</label>
                <input type="text" name="project_budget_${projectCount + 1}" class="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-kaasa-green" placeholder="5억원">
            </div>
        </div>
    `;
    
    container.appendChild(newProject);
}

// 프로젝트 제거
function removeProject(button) {
    const projectItem = button.closest('.project-item');
    if (projectItem) {
        projectItem.remove();
    }
}

// 회비 미리보기 업데이트
function updateFeePreview() {
    const feePreview = document.getElementById('kaasaFeePreview');
    const feeBreakdown = document.getElementById('feeBreakdown');
    
    if (!selectedMemberType || !feeBreakdown) return;
    
    const feeInfo = calculateKaasaFee(selectedMemberType, 0); // 기본 회비만
    const commissionRate = getKaasaCommissionRate(selectedMemberType);
    
    let breakdownHTML = `
        <div class="space-y-2">
            <div class="flex justify-between">
                <span>기본 연회비:</span>
                <span class="font-semibold">${feeInfo.baseFee.toLocaleString()}원</span>
            </div>
    `;
    
    if (['consultant_associate', 'consultant_expert', 'consultant_senior'].includes(selectedMemberType)) {
        breakdownHTML += `
            <div class="flex justify-between text-orange-600">
                <span>실적연동 추가회비:</span>
                <span>연 수익에 따라 0~70만원</span>
            </div>
            <div class="flex justify-between text-purple-600">
                <span>프로젝트 수수료율:</span>
                <span>${commissionRate}%</span>
            </div>
        `;
    }
    
    breakdownHTML += `
            <div class="border-t border-kaasa-green pt-2 mt-2">
                <div class="flex justify-between font-bold text-lg">
                    <span>연회비 총액:</span>
                    <span class="text-kaasa-green">${feeInfo.totalFee.toLocaleString()}원</span>
                </div>
            </div>
        </div>
    `;
    
    feeBreakdown.innerHTML = breakdownHTML;
}

// 가입동기 글자수 카운터
document.addEventListener('DOMContentLoaded', function() {
    const motivationTextarea = document.querySelector('[name="motivation"]');
    const motivationCount = document.getElementById('motivationCount');
    
    if (motivationTextarea && motivationCount) {
        motivationTextarea.addEventListener('input', function() {
            const length = this.value.length;
            motivationCount.textContent = length;
            
            if (length < 50) {
                motivationCount.style.color = '#EF4444'; // red
            } else {
                motivationCount.style.color = '#10B981'; // green
            }
        });
    }
});

// KAASA 회원가입 폼 제출
document.addEventListener('DOMContentLoaded', function() {
    const kaasaForm = document.getElementById('kaasaRegisterForm');
    if (kaasaForm) {
        kaasaForm.addEventListener('submit', handleKaasaRegistration);
    }
});

async function handleKaasaRegistration(event) {
    event.preventDefault();
    
    if (!validateKaasaStep(6)) {
        return;
    }
    
    const formData = new FormData(event.target);
    
    // 비밀번호 (해시는 서버에서 처리)
    const password = formData.get('password');
    
    // 전문분야 및 참여의향 배열 변환
    const specializations = Array.from(document.querySelectorAll('input[name="specializations[]"]:checked')).map(cb => cb.value);
    const participations = Array.from(document.querySelectorAll('input[name="participations[]"]:checked')).map(cb => cb.value);
    
    // 자격증 정보 수집
    const certifications = [];
    document.querySelectorAll('.certification-item').forEach((item, index) => {
        const name = item.querySelector(`[name*="cert_name"]`)?.value;
        const issuer = item.querySelector(`[name*="cert_issuer"]`)?.value;
        const date = item.querySelector(`[name*="cert_date"]`)?.value;
        
        if (name && issuer) {
            certifications.push({ name, issuer, date });
        }
    });
    
    // 학위 정보 수집
    const degrees = [];
    document.querySelectorAll('.degree-item').forEach((item, index) => {
        const name = item.querySelector(`[name*="degree_name"]`)?.value;
        const major = item.querySelector(`[name*="degree_major"]`)?.value;
        const university = item.querySelector(`[name*="degree_university"]`)?.value;
        const year = item.querySelector(`[name*="degree_year"]`)?.value;
        
        if (name && university) {
            degrees.push({ name, major, university, year });
        }
    });
    
    // 프로젝트 정보 수집
    const projects = [];
    document.querySelectorAll('.project-item').forEach((item, index) => {
        const name = item.querySelector(`[name*="project_name"]`)?.value;
        const period = item.querySelector(`[name*="project_period"]`)?.value;
        const role = item.querySelector(`[name*="project_role"]`)?.value;
        const client = item.querySelector(`[name*="project_client"]`)?.value;
        const budget = item.querySelector(`[name*="project_budget"]`)?.value;
        
        if (name && period) {
            projects.push({ name, period, role, client, budget });
        }
    });
    
    // API 요청 데이터
    const requestData = {
        email: formData.get('email'),
        password: password,
        name_kr: formData.get('name_kr'),
        mobile: formData.get('mobile'),
        birth_date: formData.get('birth_date'),
        organization: formData.get('organization'),
        position: formData.get('position'),
        address: formData.get('address'),
        postal_code: formData.get('postal_code'),
        member_type: selectedMemberType,
        specializations: specializations,
        participations: participations,
        certifications: certifications,
        degrees: degrees,
        projects: projects,
        motivation: formData.get('motivation'),
        privacy_consent: true
    };
    
    console.log('📤 KAASA 회원가입 요청:', requestData);
    
    try {
        // 백엔드 API 호출
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ 회원가입 실패:', result);
            showAlert(result.error || '회원가입 처리 중 오류가 발생했습니다.', 'error');
            return;
        }
        
        console.log('✅ KAASA 회원가입 성공:', result);
        
        showAlert(`KAASA 입회원서가 제출되었습니다!\n신청번호: ${result.memberId}\n\n관리자 승인 후 로그인하실 수 있습니다.`, 'success');
        closeKaasaRegisterModal();
        
        // 폼 초기화
        event.target.reset();
        selectedMemberType = null;
        showKaasaStep(1);
        
    } catch (error) {
        console.error('❌ KAASA 회원가입 오류:', error);
        
        if (error.message.includes('Failed to fetch')) {
            showAlert('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.', 'error');
        } else {
            showAlert('회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    }
}

// ===== KAASA 회원 타입 시스템 =====

// KAASA 회원 타입 초기화
async function initializeKaasaMemberTypes() {
    try {
        const memberTypes = await fetchTableData('member_types');
        if (memberTypes.length === 0) {
            // 7개 회원 유형 데이터 생성
            const defaultMemberTypes = [
                {
                    type_code: 'individual',
                    type_name: '개인회원',
                    base_fee: 100000,
                    performance_fee_required: false,
                    commission_rate: 0,
                    ai_education_discount: 20,
                    voting_rights: true,
                    description: '농업인, 연구자, 개인 전문가',
                    required_documents: []
                },
                {
                    type_code: 'corporate',
                    type_name: '기업회원 (중소기업)',
                    base_fee: 500000,
                    performance_fee_required: false,
                    commission_rate: 0,
                    ai_education_discount: 30,
                    voting_rights: true,
                    description: '스타트업, 중소기업',
                    required_documents: ['business_registration']
                },
                {
                    type_code: 'midsize_corporate',
                    type_name: '중견기업회원',
                    base_fee: 1000000,
                    performance_fee_required: false,
                    commission_rate: 0,
                    ai_education_discount: 40,
                    voting_rights: true,
                    description: '매출 1,000억 이상 중견기업',
                    required_documents: ['business_registration', 'revenue_proof']
                },
                {
                    type_code: 'large_corporate',
                    type_name: '대기업회원',
                    base_fee: 3000000,
                    performance_fee_required: false,
                    commission_rate: 0,
                    ai_education_discount: 50,
                    voting_rights: true,
                    description: '대기업, 공기업',
                    required_documents: ['business_registration', 'corporate_profile']
                },
                {
                    type_code: 'institution',
                    type_name: '기관회원',
                    base_fee: 2000000,
                    performance_fee_required: false,
                    commission_rate: 0,
                    ai_education_discount: 50,
                    voting_rights: true,
                    description: '대학, 연구소, 정부기관, 지자체',
                    required_documents: ['institution_certificate']
                },
                {
                    type_code: 'consultant',
                    type_name: '컨설턴트회원',
                    base_fee: 300000,
                    performance_fee_required: false,
                    commission_rate: 0,
                    ai_education_discount: 50,
                    voting_rights: true,
                    description: '스마트농업 컨설턴트, 전문가',
                    required_documents: ['certification', 'experience']
                },
                {
                    type_code: 'honorary',
                    type_name: '명예회원',
                    base_fee: 0,
                    performance_fee_required: false,
                    commission_rate: 0,
                    ai_education_discount: 100,
                    voting_rights: false,
                    description: '협회 발전 기여자, 원로 전문가',
                    required_documents: ['board_approval']
                }
            ];
            
            for (const memberType of defaultMemberTypes) {
                await createRecord('member_types', memberType);
            }
        }
    } catch (error) {
        console.error('KAASA 회원 타입 초기화 오류:', error);
    }
}

// 전문분야 코드 정의
const SPECIALIZATION_FIELDS = {
    'AI_FACILITY': 'AI 기반 시설원예',
    'PRECISION_FARMING': '노지작물 정밀농업',
    'SMART_LIVESTOCK': '축산 스마트축사',
    'BIG_DATA': '농업 빅데이터 분석',
    'ROBOTICS': '농업로봇·자동화 시스템',
    'AI_DIAGNOSIS': 'AI 병해충 진단',
    'QUALITY_AI': '농산물 품질관리 AI',
    'ICT_EQUIPMENT': '스마트팜 ICT 설비',
    'CONSULTING': '농업경영 컨설팅',
    'DIGITAL_MARKETING': '농식품 유통·마케팅',
    'HEALING_AGRICULTURE': '치유농업·도시농업',
    'POLICY': '농업정책·제도'
};

// 활동 참여 의향 코드 정의
const PARTICIPATION_ACTIVITIES = {
    'EDUCATION': 'AI 농업기술 교육·세미나 참여',
    'PROJECT': '협회 주관 프로젝트 참여',
    'NETWORKING': '회원 네트워킹·멘토링',
    'ADVISORY': '농업 AI 기술 자문',
    'POLICY_RESEARCH': '정책제안·연구용역 참여',
    'COMMITTEE': '협회 운영위원회 참여',
    'FIELD_GUIDANCE': '농가 현장 기술지도',
    'PILOT_PROJECT': 'AI 시범사업 실증',
    'INTERNATIONAL': '국제 협력사업',
    'OTHER': '기타'
};

// KAASA 회비 자동 계산 로직
function calculateKaasaFee(memberType, annualRevenue = 0) {
    let baseFee = 0;
    let performanceFee = 0;
    
    switch(memberType) {
        case 'individual':
            baseFee = 100000; // 10만원
            break;
        case 'corporate':
            baseFee = 500000; // 50만원 (중소기업)
            break;
        case 'midsize_corporate':
            baseFee = 1000000; // 100만원 (중견기업)
            break;
        case 'large_corporate':
            baseFee = 3000000; // 300만원 (대기업)
            break;
        case 'institution':
            baseFee = 2000000; // 200만원 (기관)
            break;
        case 'consultant':
            baseFee = 300000; // 30만원 (컨설턴트)
            break;
        case 'honorary':
            baseFee = 0; // 무료 (명예회원)
            break;
    }
    
    return {
        baseFee: baseFee,
        performanceFee: performanceFee,
        totalFee: baseFee + performanceFee
    };
}

// KAASA 프로젝트 수수료율 결정
function getKaasaCommissionRate(memberType) {
    switch(memberType) {
        case 'consultant_associate':
            return 10.0;
        case 'consultant_expert':
            return 7.0;
        case 'consultant_senior':
            return 5.0;
        default:
            return 0.0;
    }
}

// ===== 회원등급 시스템 =====

// 회원등급 초기화
async function initializeMemberGrades() {
    try {
        const grades = await fetchTableData('member_grades');
        if (grades.length === 0) {
            // 기본 회원등급 데이터 생성
            const defaultGrades = [
                {
                    grade_name: '브론즈',
                    grade_code: 'bronze',
                    required_points: 0,
                    discount_rate: 10,
                    benefits: ['기초과정 무료', '10% 할인'],
                    badge_color: '#CD7F32',
                    description: '신규 회원 등급'
                },
                {
                    grade_name: '실버',
                    grade_code: 'silver',
                    required_points: 1000,
                    discount_rate: 20,
                    benefits: ['중급과정까지', '20% 할인'],
                    badge_color: '#C0C0C0',
                    description: '중급 회원 등급'
                },
                {
                    grade_name: '골드',
                    grade_code: 'gold',
                    required_points: 3000,
                    discount_rate: 30,
                    benefits: ['전문과정까지', '30% 할인'],
                    badge_color: '#FFD700',
                    description: '고급 회원 등급'
                },
                {
                    grade_name: '플래티넘',
                    grade_code: 'platinum',
                    required_points: 7000,
                    discount_rate: 40,
                    benefits: ['모든과정', '40% 할인', '우선 상담'],
                    badge_color: '#E5E4E2',
                    description: '프리미엄 회원 등급'
                },
                {
                    grade_name: '다이아몬드',
                    grade_code: 'diamond',
                    required_points: 15000,
                    discount_rate: 50,
                    benefits: ['VIP 혜택', '50% 할인', '전용 상담사'],
                    badge_color: '#B9F2FF',
                    description: 'VIP 회원 등급'
                }
            ];
            
            for (const grade of defaultGrades) {
                await createRecord('member_grades', grade);
            }
        }
    } catch (error) {
        console.error('회원등급 초기화 오류:', error);
    }
}



// 회원등급에 따른 할인율 계산
async function calculateDiscount(originalPrice, memberGrade = 'bronze') {
    try {
        const grades = await fetchTableData('member_grades');
        const grade = grades.find(g => g.grade_code === memberGrade);
        
        if (grade) {
            const discountAmount = (originalPrice * grade.discount_rate) / 100;
            const discountedPrice = originalPrice - discountAmount;
            
            return {
                originalPrice,
                discountRate: grade.discount_rate,
                discountAmount,
                finalPrice: discountedPrice
            };
        }
        
        return { originalPrice, discountRate: 0, discountAmount: 0, finalPrice: originalPrice };
    } catch (error) {
        console.error('할인 계산 오류:', error);
        return { originalPrice, discountRate: 0, discountAmount: 0, finalPrice: originalPrice };
    }
}

// ===== 온라인 교육 비디오 시스템 (비활성화됨) =====
// 온라인 교육 부문이 제거되어 아래 함수들은 주석처리되었습니다.

/*
// 샘플 비디오 데이터 로드
async function loadSampleVideoData() {
    try {
        const videos = await fetchTableData('education_videos');
        if (videos.length === 0) {
            const sampleVideos = [
                {
                    course_id: 'basic-001',
                    title: '스마트농업 개론 - 1강',
                    description: '스마트농업의 기본 개념과 현황을 알아봅니다.',
                    video_url: 'https://example.com/video1.mp4',
                    thumbnail_url: 'https://via.placeholder.com/300x200/10B981/white?text=스마트농업+개론',
                    duration_minutes: 45,
                    chapter_number: 1,
                    order_index: 1,
                    access_level: 'free',
                    instructor_name: '김농업 박사',
                    upload_date: new Date().toISOString(),
                    view_count: 1250,
                    is_premium: false,
                    tags: ['기초', '개론', '스마트농업'],
                    status: 'active'
                },
                {
                    course_id: 'basic-002',
                    title: 'IoT 센서 기초',
                    description: '농업용 IoT 센서의 종류와 활용방법',
                    video_url: 'https://example.com/video2.mp4',
                    thumbnail_url: 'https://via.placeholder.com/300x200/3B82F6/white?text=IoT+센서+기초',
                    duration_minutes: 35,
                    chapter_number: 2,
                    order_index: 2,
                    access_level: 'bronze',
                    instructor_name: '이기술 교수',
                    upload_date: new Date().toISOString(),
                    view_count: 890,
                    is_premium: false,
                    tags: ['IoT', '센서', '기초'],
                    status: 'active'
                },
                {
                    course_id: 'advanced-001',
                    title: 'AI 기반 병충해 진단',
                    description: '인공지능을 활용한 스마트한 병충해 진단 시스템',
                    video_url: 'https://example.com/video3.mp4',
                    thumbnail_url: 'https://via.placeholder.com/300x200/8B5CF6/white?text=AI+병충해+진단',
                    duration_minutes: 60,
                    chapter_number: 1,
                    order_index: 1,
                    access_level: 'gold',
                    instructor_name: '박AI 연구원',
                    upload_date: new Date().toISOString(),
                    view_count: 567,
                    is_premium: true,
                    tags: ['AI', '병충해', '진단'],
                    status: 'active'
                },
                {
                    course_id: 'premium-001',
                    title: '스마트팜 경영 전략',
                    description: '데이터 기반 스마트팜 경영 노하우',
                    video_url: 'https://example.com/video4.mp4',
                    thumbnail_url: 'https://via.placeholder.com/300x200/F59E0B/white?text=경영+전략',
                    duration_minutes: 75,
                    chapter_number: 1,
                    order_index: 1,
                    access_level: 'platinum',
                    instructor_name: '정경영 컨설턴트',
                    upload_date: new Date().toISOString(),
                    view_count: 234,
                    is_premium: true,
                    tags: ['경영', '전략', '데이터'],
                    status: 'active'
                }
            ];
            
            for (const video of sampleVideos) {
                await createRecord('education_videos', video);
            }
        }
    } catch (error) {
        console.error('비디오 데이터 로드 오류:', error);
    }
}

// 비디오 목록 로드
async function loadVideos(filter = 'all') {
    try {
        let videos = await fetchTableData('education_videos');
        
        // 사용자 등급에 따른 접근 권한 필터링
        if (currentUser) {
            const userGrade = currentUser.member_grade || 'bronze';
            const gradeHierarchy = ['free', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
            const userLevel = gradeHierarchy.indexOf(userGrade);
            
            videos = videos.filter(video => {
                const videoLevel = gradeHierarchy.indexOf(video.access_level);
                return videoLevel <= userLevel;
            });
        } else {
            videos = videos.filter(video => video.access_level === 'free');
        }
        
        // 필터 적용
        if (filter !== 'all') {
            if (filter === 'premium') {
                videos = videos.filter(video => video.is_premium);
            } else {
                videos = videos.filter(video => video.access_level === filter);
            }
        }
        
        displayVideos(videos);
    } catch (error) {
        console.error('비디오 로드 오류:', error);
        showAlert('비디오를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// 비디오 목록 표시
function displayVideos(videos) {
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) return;
    
    if (videos.length === 0) {
        videoGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-video text-gray-400 text-4xl mb-4"></i>
                <p class="text-gray-600">해당하는 강의가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    videoGrid.innerHTML = videos.map(video => `
        <div class="video-card bg-white rounded-xl shadow-lg overflow-hidden">
            <div class="relative">
                <img src="${video.thumbnail_url}" alt="${video.title}" class="w-full h-48 object-cover">
                <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-300">
                    <button onclick="playVideo('${video.id}')" class="bg-white bg-opacity-20 text-white rounded-full p-4 hover:bg-opacity-30 transition duration-300">
                        <i class="fas fa-play text-2xl"></i>
                    </button>
                </div>
                
                <!-- 프리미엄 배지 -->
                ${video.is_premium ? '<div class="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">PREMIUM</div>' : ''}
                
                <!-- 재생시간 -->
                <div class="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                    ${video.duration_minutes}분
                </div>
            </div>
            
            <div class="p-4">
                <h4 class="font-bold text-lg text-gray-800 mb-2 line-clamp-2">${video.title}</h4>
                <p class="text-gray-600 text-sm mb-3 line-clamp-2">${video.description}</p>
                
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-500">
                        <i class="fas fa-user mr-1"></i>${video.instructor_name}
                    </span>
                    <span class="text-sm text-gray-500">
                        <i class="fas fa-eye mr-1"></i>${video.view_count.toLocaleString()}
                    </span>
                </div>
                
                <!-- 접근 레벨 표시 -->
                <div class="flex items-center justify-between">
                    <span class="px-2 py-1 rounded text-xs font-medium ${getAccessLevelStyle(video.access_level)}">
                        ${getAccessLevelName(video.access_level)}
                    </span>
                    
                    ${currentUser ? `
                        <button onclick="playVideo('${video.id}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300">
                            <i class="fas fa-play mr-1"></i>시청하기
                        </button>
                    ` : `
                        <button onclick="openLoginModal()" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300">
                            <i class="fas fa-lock mr-1"></i>로그인
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

// 접근 레벨 스타일 반환
function getAccessLevelStyle(level) {
    const styles = {
        'free': 'bg-green-100 text-green-800',
        'bronze': 'bg-orange-100 text-orange-800',
        'silver': 'bg-gray-100 text-gray-800',
        'gold': 'bg-yellow-100 text-yellow-800',
        'platinum': 'bg-purple-100 text-purple-800',
        'diamond': 'bg-blue-100 text-blue-800'
    };
    return styles[level] || 'bg-gray-100 text-gray-800';
}

// 접근 레벨 이름 반환
function getAccessLevelName(level) {
    const names = {
        'free': '무료',
        'bronze': 'BRONZE',
        'silver': 'SILVER',
        'gold': 'GOLD',
        'platinum': 'PLATINUM',
        'diamond': 'DIAMOND'
    };
    return names[level] || level.toUpperCase();
}

// 비디오 필터링
function filterVideos(filter) {
    // 탭 버튼 활성화 상태 변경
    document.querySelectorAll('.video-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    loadVideos(filter);
}

// 비디오 검색
function searchVideos() {
    const searchQuery = document.getElementById('videoSearch')?.value?.trim();
    const sortBy = document.getElementById('videoSortBy')?.value;
    
    // 검색 로직 구현 (실제로는 API 쿼리 파라미터 사용)
    loadVideos('all'); // 임시로 전체 로드
}

// 비디오 재생
async function playVideo(videoId) {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    
    try {
        const videos = await fetchTableData('education_videos');
        const video = videos.find(v => v.id === videoId);
        
        if (!video) {
            showAlert('비디오를 찾을 수 없습니다.', 'error');
            return;
        }
        
        // 접근 권한 확인
        const userGrade = currentUser.member_grade || 'bronze';
        const gradeHierarchy = ['free', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
        const userLevel = gradeHierarchy.indexOf(userGrade);
        const videoLevel = gradeHierarchy.indexOf(video.access_level);
        
        if (videoLevel > userLevel) {
            showAlert(`이 강의는 ${getAccessLevelName(video.access_level)} 등급 이상만 시청 가능합니다.`, 'warning');
            return;
        }
        
        openVideoPlayer(video);
        
        // 조회수 증가
        await updateRecord('education_videos', videoId, {
            ...video,
            view_count: video.view_count + 1
        });
        
    } catch (error) {
        console.error('비디오 재생 오류:', error);
        showAlert('비디오 재생 중 오류가 발생했습니다.', 'error');
    }
}

// 비디오 플레이어 열기
function openVideoPlayer(video) {
    const modal = document.getElementById('videoPlayerModal');
    const title = document.getElementById('videoPlayerTitle');
    const content = document.getElementById('videoPlayerContent');
    const info = document.getElementById('videoPlayerInfo');
    
    if (!modal || !title || !content || !info) return;
    
    title.textContent = video.title;
    
    // 실제로는 비디오 플레이어 구현
    content.innerHTML = `
        <div class="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <div class="text-center">
                <i class="fas fa-play-circle text-8xl mb-4 opacity-50"></i>
                <p class="text-xl mb-2">${video.title}</p>
                <p class="text-gray-400">실제 비디오 플레이어가 여기에 표시됩니다</p>
                <p class="text-sm text-gray-500 mt-2">Duration: ${video.duration_minutes}분</p>
            </div>
        </div>
    `;
    
    info.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">강의 정보</h4>
            <p class="text-sm text-gray-600 mb-1"><i class="fas fa-user mr-2"></i>${video.instructor_name}</p>
            <p class="text-sm text-gray-600 mb-1"><i class="fas fa-clock mr-2"></i>${video.duration_minutes}분</p>
            <p class="text-sm text-gray-600"><i class="fas fa-eye mr-2"></i>조회수 ${video.view_count.toLocaleString()}</p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">강의 설명</h4>
            <p class="text-sm text-gray-600">${video.description}</p>
        </div>
        
        <div class="bg-gray-50 p-4 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-2">태그</h4>
            <div class="flex flex-wrap gap-2">
                ${video.tags?.map(tag => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">#${tag}</span>`).join('') || ''}
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// 비디오 플레이어 닫기
function closeVideoPlayer() {
    const modal = document.getElementById('videoPlayerModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}
*/

// 마이페이지 열기
async function openMyPage() {
    if (!currentUser) {
        openLoginModal();
        return;
    }
    
    const modal = document.getElementById('myPageModal');
    const content = document.getElementById('myPageContent');
    
    if (!modal || !content) return;
    
    try {
        // 사용자의 신청 내역, 학습 진도 등을 로드
        const applications = await fetchTableData('service_applications', { search: currentUser.email });
        const videoProgress = await fetchTableData('member_video_progress', { search: currentUser.id });
        
        content.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- 프로필 정보 -->
                <div class="lg:col-span-1">
                    <div class="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
                        <div class="text-center mb-6">
                            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-user text-green-600 text-2xl"></i>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800">${currentUser.name}</h3>
                            <p class="text-gray-600">${currentUser.email}</p>
                            <div class="mt-2">
                                <span class="px-3 py-1 rounded-full text-sm font-medium bg-${currentUser.member_grade || 'bronze'} text-white">
                                    ${getGradeName(currentUser.member_grade || 'bronze')}
                                </span>
                            </div>
                        </div>
                        
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">연락처:</span>
                                <span class="font-medium">${currentUser.phone || '-'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">가입일:</span>
                                <span class="font-medium">${formatDate(currentUser.join_date)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">포인트:</span>
                                <span class="font-medium text-green-600">${currentUser.total_points || 0}P</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 활동 현황 -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- 신청 내역 -->
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <h4 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>최근 신청 내역
                        </h4>
                        ${applications.length > 0 ? `
                            <div class="space-y-3">
                                ${applications.slice(0, 3).map(app => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <h5 class="font-medium text-gray-800">${getServiceName(app.service_type)}</h5>
                                            <p class="text-sm text-gray-600">${formatDate(app.application_date)}</p>
                                        </div>
                                        <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(app.status)}">
                                            ${getStatusName(app.status)}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500 text-center py-4">신청 내역이 없습니다.</p>'}
                    </div>
                    
                    <!-- 학습 진도 -->
                    <div class="bg-white p-6 rounded-xl shadow-lg">
                        <h4 class="text-lg font-bold text-gray-800 mb-4">
                            <i class="fas fa-chart-line text-green-600 mr-2"></i>학습 진도
                        </h4>
                        ${videoProgress.length > 0 ? `
                            <div class="space-y-3">
                                ${videoProgress.slice(0, 3).map(progress => `
                                    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div class="flex-1">
                                            <h5 class="font-medium text-gray-800">강의 ID: ${progress.video_id}</h5>
                                            <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div class="bg-green-600 h-2 rounded-full" style="width: ${progress.progress_percentage}%"></div>
                                            </div>
                                        </div>
                                        <span class="ml-4 text-sm font-medium text-gray-600">${progress.progress_percentage}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p class="text-gray-500 text-center py-4">학습 기록이 없습니다.</p>'}
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('마이페이지 로드 오류:', error);
        showAlert('마이페이지를 불러오는 중 오류가 발생했습니다.', 'error');
    }
}

// ===== 간편 회원가입 시스템 =====

// 간편 가입 폼 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', function() {
    const simpleJoinForm = document.getElementById('simpleJoinForm');
    if (simpleJoinForm) {
        simpleJoinForm.addEventListener('submit', handleSimpleJoin);
    }
});

// 간편 가입 처리
async function handleSimpleJoin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        organization: formData.get('organization'),
        interest_field: formData.get('interest_field'),
        member_type: 'individual', // 기본값: 개인회원
        member_status: 'pending', // 신규 가입: pending 상태
        is_paid: false,
        is_verified: false,
        join_date: new Date().getTime(),
        total_points: 0,
        member_grade: 'bronze'
    };
    
    // 유효성 검사
    if (!data.name || !data.email || !data.phone || !data.organization || !data.interest_field) {
        alert('모든 필수 항목을 입력해주세요.');
        return;
    }
    
    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }
    
    // 연락처 형식 검사
    const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
    if (!phoneRegex.test(data.phone.replace(/[^0-9]/g, ''))) {
        alert('올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)');
        return;
    }
    
    // 개인정보 동의 확인
    if (!formData.get('privacy_consent')) {
        alert('개인정보 수집 및 이용에 동의해주세요.');
        return;
    }
    
    try {
        // 중복 이메일 확인
        const existingMembers = await fetchTableData('members', { search: data.email });
        if (existingMembers.length > 0) {
            alert('이미 가입된 이메일입니다.\n\n로그인 페이지로 이동하시겠습니까?');
            if (confirm('로그인 페이지로 이동하시겠습니까?')) {
                openLoginModal();
            }
            return;
        }
        
        // 회원 등록
        const newMember = await createRecord('members', data);
        
        if (newMember) {
            // 성공 메시지
            alert(`🎉 가입을 환영합니다, ${data.name}님!\n\n준회원으로 가입되었습니다.\n24시간 이내에 최적화된 회원 유형을 이메일로 안내해 드립니다.\n\n감사합니다!`);
            
            // 환영 이메일 발송 (실제로는 서버에서 처리)
            console.log('환영 이메일 발송:', data.email);
            
            // 관리자에게 신규 회원 알림 (실제로는 서버에서 처리)
            console.log('관리자 알림: 신규 회원 가입', newMember);
            
            // 폼 초기화
            e.target.reset();
            
            // 성공 페이지로 이동 또는 로그인 제안
            if (confirm('지금 바로 로그인하시겠습니까?')) {
                openLoginModal();
            } else {
                // 페이지 상단으로 스크롤
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
        
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.\n\n문의: info@kaasa.ai');
    }
}

// 회원 상태별 관리 함수

// 신규 회원 승인 (관리자용)
async function approveMember(memberId, recommendedType) {
    try {
        const member = await fetchRecord('members', memberId);
        
        if (!member) {
            throw new Error('회원 정보를 찾을 수 없습니다.');
        }
        
        // 회원 상태 업데이트
        await updateRecord('members', memberId, {
            member_type: recommendedType,
            member_status: 'active_free' // 무료 준회원 상태로 변경
        });
        
        // 정회원 안내 이메일 발송 (실제로는 서버에서 처리)
        console.log('정회원 안내 이메일 발송:', member.email, recommendedType);
        
        return true;
    } catch (error) {
        console.error('회원 승인 오류:', error);
        return false;
    }
}

// 정회원 전환 처리 (결제 완료 후)
async function upgradeToPaidMember(memberId, memberType, paymentAmount) {
    try {
        await updateRecord('members', memberId, {
            member_type: memberType,
            member_status: 'active_paid',
            is_paid: true,
            payment_date: new Date().getTime(),
            payment_amount: paymentAmount
        });
        
        // 정회원 환영 이메일 발송
        console.log('정회원 환영 이메일 발송');
        
        return true;
    } catch (error) {
        console.error('정회원 전환 오류:', error);
        return false;
    }
}

// 회원 상태 확인
function getMemberStatusText(status) {
    const statusMap = {
        'pending': '검토 대기',
        'active_free': '준회원 (무료)',
        'active_paid': '정회원 (유료)',
        'suspended': '정지',
        'withdrawn': '탈퇴'
    };
    return statusMap[status] || '알 수 없음';
}

// 회원 유형명 가져오기
function getMemberTypeName(type) {
    const typeMap = {
        'individual': '개인회원',
        'corporate': '기업회원 (중소기업)',
        'midsize_corporate': '중견기업회원',
        'large_corporate': '대기업회원',
        'institution': '기관회원',
        'consultant': '컨설턴트회원',
        'honorary': '명예회원'
    };
    return typeMap[type] || '미정';
}

// RESTful API 헬퍼 함수들

// 테이블 데이터 가져오기
async function fetchTableData(tableName, params = {}) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const url = `/tables/${tableName}${queryString ? '?' + queryString : ''}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error(`테이블 데이터 가져오기 오류 (${tableName}):`, error);
        return [];
    }
}

// 단일 레코드 가져오기
async function fetchRecord(tableName, recordId) {
    try {
        const response = await fetch(`/tables/${tableName}/${recordId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`레코드 가져오기 오류 (${tableName}/${recordId}):`, error);
        return null;
    }
}

// 레코드 생성
async function createRecord(tableName, data) {
    try {
        const response = await fetch(`/tables/${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`레코드 생성 오류 (${tableName}):`, error);
        return null;
    }
}

// 레코드 업데이트
async function updateRecord(tableName, recordId, data) {
    try {
        const response = await fetch(`/tables/${tableName}/${recordId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`레코드 업데이트 오류 (${tableName}/${recordId}):`, error);
        return null;
    }
}

// 레코드 삭제
async function deleteRecord(tableName, recordId) {
    try {
        const response = await fetch(`/tables/${tableName}/${recordId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error(`레코드 삭제 오류 (${tableName}/${recordId}):`, error);
        return false;
    }
}

// 마이페이지 열기
function openMyPage() {
    const modal = document.getElementById('myPageModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // 사용자 드롭다운 닫기
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.add('hidden');
    }
}

// 마이페이지 닫기
function closeMyPageModal() {
    const modal = document.getElementById('myPageModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// 상태 스타일 반환
function getStatusStyle(status) {
    const styles = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'in_progress': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
}

// 상태 이름 반환
function getStatusName(status) {
    const names = {
        'pending': '대기중',
        'in_progress': '진행중',
        'completed': '완료',
        'cancelled': '취소됨'
    };
    return names[status] || status;
}

// 내 신청내역 보기
function openMyApplications() {
    // 드롭다운 닫기
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.add('hidden');
    
    // 신청관리 섹션으로 이동
    scrollToSection('applications');
}

// 학습 진도 보기 (비활성화됨 - 온라인 교육 섹션 제거)
/*
function openMyProgress() {
    // 드롭다운 닫기
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.add('hidden');
    
    // 온라인 교육 섹션으로 이동
    scrollToSection('online-education');
}
*/

// 모달 외부 클릭시 닫기
document.addEventListener('click', function(e) {
    const serviceModal = document.getElementById('serviceModal');
    const expertModal = document.getElementById('expertModal');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const kaasaRegisterModal = document.getElementById('kaasaRegisterModal');
    const myPageModal = document.getElementById('myPageModal');
    const videoPlayerModal = document.getElementById('videoPlayerModal');
    
    if (e.target === serviceModal) closeServiceModal();
    if (e.target === expertModal) closeExpertModal();
    if (e.target === loginModal) closeLoginModal();
    if (e.target === registerModal) closeRegisterModal();
    if (e.target === kaasaRegisterModal) closeKaasaRegisterModal();
    if (e.target === myPageModal) closeMyPageModal();
    // if (e.target === videoPlayerModal) closeVideoPlayer(); // 비활성화됨
    
    // 사용자 드롭다운 외부 클릭시 닫기
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenu && userDropdown && !userMenu.contains(e.target)) {
        userDropdown.classList.add('hidden');
    }
});

// ===== 전역 함수 노출 (inline onclick 지원) =====
// index.html의 onclick 핸들러가 작동하도록 window 객체에 명시적으로 할당
console.log('🔧 전역 함수 노출 시작...');
console.log('  - openLoginModal 정의 여부:', typeof openLoginModal);
console.log('  - openKaasaRegisterModal 정의 여부:', typeof openKaasaRegisterModal);

window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.openKaasaRegisterModal = openKaasaRegisterModal;
window.closeKaasaRegisterModal = closeKaasaRegisterModal;
window.openRegisterModal = openRegisterModal;
window.closeRegisterModal = closeRegisterModal;
window.logout = logout;
window.toggleUserDropdown = toggleUserDropdown;
window.openMyPage = openMyPage;
window.closeMyPageModal = closeMyPageModal;
window.openMyApplications = openMyApplications;

// KAASA 관련 함수
window.selectMemberType = selectMemberType;
window.nextKaasaStep = nextKaasaStep;
window.prevKaasaStep = prevKaasaStep;
window.showCorporateFields = showCorporateFields;
window.addCertification = addCertification;
window.addDegree = addDegree;
window.addProject = addProject;

console.log('✅ 전역 함수 노출 완료');
console.log('  - window.openLoginModal 여부:', typeof window.openLoginModal);
console.log('  - window.openKaasaRegisterModal 여부:', typeof window.openKaasaRegisterModal);

// 전역 등록 완료 표시
window._kaasaFunctionsReady = true;
console.log('🎉 KAASA 전역 함수 준비 완료!');

// 최종 검증
if (typeof window.openLoginModal !== 'function') {
    console.error('❌ CRITICAL: window.openLoginModal이 함수가 아닙니다!');
    console.error('  - openLoginModal 원본:', typeof openLoginModal);
    
    // 긴급 복구 시도
    if (typeof openLoginModal === 'function') {
        window.openLoginModal = openLoginModal;
        console.log('🔧 긴급 복구: openLoginModal 재등록 완료');
    }
}
if (typeof window.openKaasaRegisterModal !== 'function') {
    console.error('❌ CRITICAL: window.openKaasaRegisterModal이 함수가 아닙니다!');
    console.error('  - openKaasaRegisterModal 원본:', typeof openKaasaRegisterModal);
    
    // 긴급 복구 시도
    if (typeof openKaasaRegisterModal === 'function') {
        window.openKaasaRegisterModal = openKaasaRegisterModal;
        console.log('🔧 긴급 복구: openKaasaRegisterModal 재등록 완료');
    }
}
