// 브라우저 콘솔로 로그를 남깁니다.

(function () {
	/** 랜덤 보디빌딩 웹 애플리케이션 - 운동 종목·세트·포징을 무작위로 뽑아주는 인터랙티브 웹 앱 */

	// ---------- 기본 데이터 (하드코딩 없이 상수로 분리) ----------

	var DEFAULT_EXERCISES = [
		"플랫 바벨 벤치 프레스",
		"인클라인 바벨 벤치프레스",
		"플랫 덤벨 벤치 프레스",
		"인클라인 덤벨 벤치 프레스",
		"플랫 덤벨 플라이",
		"플랫 덤벨 풀오버",
		"스탠딩 바벨 컬",
		"스탠딩 리버스 바벨 컬",
		"스탠딩 덤벨 컬",
		"스탠딩 얼터네이트 덤벨 컬",
		"스탠딩 덤벨 해머 컬",
		"스탠딩 얼터네이트 해머 컬",
		"컨센트레이션 덤벨 컬",
		"스탠딩 바벨 오버헤드 트라이셉스 익스텐션",
		"스탠딩 원암 덤벨 오버헤드 트라이셉스 익스텐션",
		"라잉 바벨 트라이셉스 익스텐션",
		"덤벨 킥백",
		"벤치 딥스",
		"바벨 리스트 컬",
		"바벨 리버스 리스트 컬",
		"덤벨 리스트 컬",
		"덤벨 리버스 리스트 컬",
		"컨벤셔널 데드리프트",
		"루마니안 데드리프트",
		"벤트오버 바벨 로우",
		"언더그립 바벨 로우",
		"뉴트럴그립 투암 덤벨 로우",
		"벤트오버 원암 덤벨 로우",
		"바벨 쉬러그",
		"덤벨 쉬러그",
		"바벨 굿모닝 엑서사이즈",
		"스탠딩 밀리터리 프레스 (바벨 오버헤드 프레스)",
		"스탠딩 비하인드 넥 프레스",
		"스탠딩 덤벨 숄더 프레스",
		"스탠딩 바벨 프런트 레이즈",
		"스탠딩 덤벨 프런트 레이즈",
		"덤벨 벤트오버 레터럴 레이즈",
		"바벨 업라이트 로우",
		"크런치",
		"레그 레이즈",
		"싯업",
		"시티드 니업",
		"리버스 크런치",
		"덤벨 사이드 밴드",
		"바벨 백 스쿼트",
		"바벨 프런트 스쿼트",
		"고블릿 스쿼트",
		"덤벨 불가리안 스플릿 스쿼트",
		"스티프 레그 데드리프트",
		"바벨 런지",
		"덤벨 런지",
	];

	var DEFAULT_SETS = [
		"하체 트라이세트",
		"삼두 트라이세트",
		"이두 트라이세트",
		"어깨 트라이세트",
		"등 트라이세트",
		"가슴 트라이세트",
		"전완 신전 컴파운드세트",
		"복부 트라이세트",
		"하체 컴파운드세트",
		"삼두 컴파운드세트",
		"이두 컴파운드세트",
		"어깨 컴파운드세트",
		"등 컴파운드세트",
		"가슴 컴파운드세트",
		"전완 굴곡 컴파운드세트",
		"복부 컴파운드세트",
		"이두·삼두 슈퍼세트",
	];

	var DEFAULT_POSES = [
		"보디빌딩 규정포즈 7개",
		"클래식 보디빌딩 규정포즈 7개",
		"남자 피지크 쿼터턴",
		"여자 피지크 규정포즈 4개",
		"여자 피지크 쿼터턴",
		"여자 보디피트니스",
		"여자 비키니",
	];

	// ---------- 유틸리티 함수 ----------

	/** 배열을 제자리에서 섞고 반환 */
	var shuffleArray = function (arr) {
		// Fisher-Yates 셔플

		for (var i = arr.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = arr[i];

			arr[i] = arr[j];
			arr[j] = temp;
		}

		return arr;
	};

	/** 크로스사이트 스크립팅을 막기 위하여 `<`, `>`, `&`, `"`, `'` 따위를 HTML 엔티티로 이스케이프하는 도우미 함수 */
	var escapeHTML = function (str) {
		return String(str)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	/** 공통 풀(Pool) 클래스 - 중복 추적을 통해 항목을 무작위로 뽑는 기본 클래스 */

	var BasePool = function (items) {
		/** 풀에 들어 있는 항목의 복사본 */
		this.items = items ? items.slice() : [];

		/** 선택된 항목을 객체 키로 관리 */
		this.picked = {};

		/** 풀 유형 식별자 (로깅에 사용) */
		this.type = "base";
	};

	BasePool.prototype.resetPicked = function () {
		// `picked` 객체를 비워서 뽑기 기록 초기화
		this.picked = {};
	};

	/** 풀 전체를 교체하고 뽑기 기록도 초기화 */
	BasePool.prototype.setItems = function (newItems) {
		// 복사
		this.items = newItems.slice();

		// 풀이 바뀌면 선택 기록도 초기화
		this.picked = {};
	};

	/** 전체 항목 수에서 이미 뽑은 수를 뺀 나머지 개수 */
	BasePool.prototype.getRemainingCount = function () {
		return this.items.length - Object.keys(this.picked).length;
	};

	/** 아직 뽑히지 않은 항목만 필터링하여 반환 */
	BasePool.prototype.getAvailableItems = function () {
		var self = this;

		return this.items.filter(function (item) {
			return !self.picked[item];
		});
	};

	BasePool.prototype.drawOne = function () {
		// 남은 항목 중 하나를 무작위로 뽑고, `picked`에 기록

		var available = this.getAvailableItems();
		if (available.length === 0) return null;

		var idx = Math.floor(Math.random() * available.length);
		var chosen = available[idx];
		this.picked[chosen] = true;
		console.log(this.type + " 1개 뽑음:" + chosen);

		return chosen;
	};

	/** 운동 종목 풀 - BasePool을 확장하여 운동 종목 전용 추첨 기능을 제공 */

	/** ExercisePool 생성자 - 부모 BasePool을 호출하고 운동 종목 유형을 설정 */
	var ExercisePool = function (items) {
		BasePool.call(this, items);
		this.type = "exercise";
	};

	ExercisePool.prototype = Object.create(BasePool.prototype);
	ExercisePool.prototype.constructor = ExercisePool;

	/** 가용 항목을 셔플한 뒤 앞에서 `count`개를 뽑아 기록하고 반환 */
	ExercisePool.prototype.drawMultiple = function (count) {
		/*
			`drawMultiple()` 메서드는 전체 가용 목록을 셔플한 뒤 슬라이싱하므로
			부분 셔플〔Partial Fisher-Yates〕보다 효율적이진 않지만 코드가 간결하고 동작이 명확함.
		*/

		var available = this.getAvailableItems();
		if (available.length === 0) return [];

		var shuffled = shuffleArray(available.slice()); // 복사해서 셔플
		var toPick = Math.min(count, shuffled.length);
		var chosen = shuffled.slice(0, toPick);
		var self = this;

		chosen.forEach(function (item) {
			self.picked[item] = true;
		});

		console.log("운동 " + toPick + "개 뽑음:" + chosen.join(", "));
		return chosen;
	};

	/** 세트 풀 - BasePool을 확장하여 세트(컴파운드세트·트라이세트 등)를 관리 */
	/** SetPool 생성자 - 부모 BasePool을 호출하고 세트 유형을 설정 */
	var SetPool = function (items) {
		BasePool.call(this, items);
		this.type = "set";
	};

	SetPool.prototype = Object.create(BasePool.prototype);
	SetPool.prototype.constructor = SetPool;

	/** 세트 전용 drawRandom - 내부적으로 drawOne을 호출하여 하나의 세트를 무작위로 뽑음 */
	SetPool.prototype.drawRandom = function () {
		return this.drawOne();
	};

	/** 포즈 풀 - 중복 추적 없이 무작위로 포즈 모음을 뽑는 독립적인 풀 */
	// 매번 무작위로 뽑되 이전 기록을 지우지 않는 『추첨 복원 샘플링』 방식

	/** PosePool 생성자 - items 배열을 받아 복사본을 저장 (중복 추적하지 않음) */
	var PosePool = function (items) {
		if (!items) items = [];
		this.items = items.slice();
	};

	/** 풀 교체 (중복 추적 없음) */
	PosePool.prototype.setItems = function (newItems) {
		this.items = newItems.slice();
		console.log("포징 풀 업데이트:" + this.items.length);
	};

	PosePool.prototype.drawRandom = function () {
		// 남은 항목 중 하나를 무작위로 뽑지만, `picked` 기록 없음 (같은 포즈를 여러 번 뽑을 수 있음)
		if (this.items.length === 0) return null;
		var idx = Math.floor(Math.random() * this.items.length);
		return this.items[idx];
	};

	/** 전체 앱의 오케스트레이터 구실을 하는 메인 앱 클래스 - 풀들을 생성하고 UI 이벤트를 연결 */

	/** RandomBodybuildingApp 생성자 - 풀들을 초기화하고 UI를 설정 */
	var RandomBodybuildingApp = function () {
		this.exercisePool = new ExercisePool(DEFAULT_EXERCISES);
		this.setPool = new SetPool(DEFAULT_SETS);
		this.posePool = new PosePool(DEFAULT_POSES);

		this.initUI();
		this.updateRemainingDisplay();
		console.log("앱 초기화 완료");
	};

	/** UI 초기화 - DOM 요소를 캐싱하고 이벤트 리스너를 연결 */
	RandomBodybuildingApp.prototype.initUI = function () {
		var self = this;

		// DOM 요소 캐싱

		this.remainingSpan = document.getElementById("remainingCount");

		this.remainingSetsSpan = document.getElementById("remainingSetsCount");

		this.resultCard = document.getElementById("resultCard");
		this.drawCountInput = document.getElementById("drawCount");
		this.editModal = document.getElementById("editModal");
		this.editExercisesTA = document.getElementById("editExercises");
		this.editSetsTA = document.getElementById("editSets");
		this.editPosesTA = document.getElementById("editPoses");

		// 이벤트 리스너 연결

		/*
			『종목 하나 뽑기』 버튼을 누르면 저항운동 종목을 무작위로 하나씩 뽑아 표시합니다.
			이미 표시한 저항운동 종목은 뽑지 않습니다.
		*/
		document
			.getElementById("btnPickOne")
			.addEventListener("click", function () {
				self.handlePickOne();
			});

		/*
			『종목 여럿 뽑기』 버튼을 누르면 저항운동 종목을 무작위로 세 개(갯수는 사용자가 바꿀 수 있습니다.)씩 뽑아 표시합니다.\
			이미 표시한 저항운동 종목은 뽑지 않습니다.
		*/
		document
			.getElementById("btnPickMultiple")
			.addEventListener("click", function () {
				self.handlePickMultiple();
			});

		/*
			『종목 여럿 + 세트 하나』 뽑기 버튼을 누르면 저항운동 종목을 무작위로 세 개(갯수는 사용자가 바꿀 수 있습니다.)씩 뽑고
			저항운동 세트도 무작위로 하나 뽑아 함께 표시합니다.
			이미 표시한 저항운동 종목은 뽑지 않습니다. 이미 표시한 저항운동 세트도 뽑지 않습니다.
		*/
		document
			.getElementById("btnPickMultipleSet")
			.addEventListener("click", function () {
				self.handlePickMultipleWithSet();
			});

		/*
			『종목 여럿 + 세트 하나 + 포즈 모음 하나』 뽑기 버튼을 누르면
			저항운동 종목을 무작위로 세 개(갯수는 사용자가 바꿀 수 있습니다.)씩 뽑고 저항운동 세트도 무작위로 하나 뽑고
			보디빌딩 포즈 모음도 무작위로 하나 뽑아 함께 표시합니다!!
			이미 표시한 저항운동 종목은 뽑지 않습니다. 이미 표시한 저항운동 세트도 뽑지 않습니다.
		*/
		document
			.getElementById("btnPickMultipleSetPose")
			.addEventListener("click", function () {
				self.handlePickMultipleWithSetAndPose();
			});

		// 『초기화』 버튼을 누르면 남은 저항운동 종목과 남은 저항운동 세트가 초기화됩니다.
		document
			.getElementById("btnReset")
			.addEventListener("click", function () {
				self.handleReset();
			});

		/*
			『목록 편집』 버튼을 누르면 사용자가 다음을 각각 편집하거나 각각 초기화할 수 있는 대화상자가 열립니다:
			◈ 저항운동 종목 목록
			◈ 저항운동 세트 목록
			◈ 보디빌딩 포즈 모음 목록
		*/
		document
			.getElementById("btnEditList")
			.addEventListener("click", function () {
				self.openEditModal();
			});

		document
			.getElementById("cancelEdit")
			.addEventListener("click", function () {
				self.closeEditModal();
			});

		document
			.getElementById("saveEdit")
			.addEventListener("click", function () {
				self.saveEditChanges();
			});

		document
			.getElementById("resetExercises")
			.addEventListener("click", function () {
				self.resetExercisesToDefault();
			});

		document
			.getElementById("resetSets")
			.addEventListener("click", function () {
				self.resetSetsToDefault();
			});

		document
			.getElementById("resetPoses")
			.addEventListener("click", function () {
				self.resetPosesToDefault();
			});

		// 모달 바깥 클릭 시 닫기
		this.editModal.addEventListener("click", function (e) {
			if (e.target === self.editModal) self.closeEditModal();
		});
	};

	/** 입력 필드에서 뽑기 개수를 읽어와 정수로 반환 */
	RandomBodybuildingApp.prototype.getDrawCount = function () {
		var val = parseInt(this.drawCountInput.value, 10);
		return isNaN(val) || val < 1 ? 1 : val;
	};

	// --- 핸들러 메서드 ---

	/** "종목 하나 뽑기" 버튼 */
	RandomBodybuildingApp.prototype.handlePickOne = function () {
		var exercise = this.exercisePool.drawOne();

		if (!exercise) {
			alert(
				"더 이상 뽑을 운동 종목이 없습니다. 초기화하거나 목록을 편집해 주세요.",
			);

			return;
		}

		this.displayResult({ exercises: [exercise], set: null, pose: null });
		this.updateRemainingDisplay();
	};

	/** "종목 여럿 뽑기" 버튼 */
	RandomBodybuildingApp.prototype.handlePickMultiple = function () {
		if (!this.validateDraw(false)) return;

		var count = this.getDrawCount();
		var exercises = this.exercisePool.drawMultiple(count);

		if (exercises.length === 0) {
			alert("뽑을 수 있는 운동이 없습니다.");
			return;
		}

		this.displayResult({ exercises: exercises, set: null, pose: null });
		this.updateRemainingDisplay();
	};

	/** "종목여럿+세트" 버튼 */
	RandomBodybuildingApp.prototype.handlePickMultipleWithSet = function () {
		if (!this.validateDraw(true)) return;

		var count = this.getDrawCount();
		var exercises = this.exercisePool.drawMultiple(count);
		var set = this.setPool.drawRandom();

		this.displayResult({ exercises: exercises, set: set, pose: null });
		this.updateRemainingDisplay();
	};

	/** "종목여럿+세트+포징" 버튼 */
	RandomBodybuildingApp.prototype.handlePickMultipleWithSetAndPose =
		function () {
			if (!this.validateDraw(true)) return;

			var count = this.getDrawCount();
			var exercises = this.exercisePool.drawMultiple(count);
			var set = this.setPool.drawRandom();
			var pose = this.posePool.drawRandom();

			this.displayResult({ exercises: exercises, set: set, pose: pose });
			this.updateRemainingDisplay();
		};

	/** "초기화" 버튼 */
	RandomBodybuildingApp.prototype.handleReset = function () {
		this.exercisePool.resetPicked();
		this.setPool.resetPicked();
		this.updateRemainingDisplay();
		this.resultCard.classList.remove("visible");

		this.resultCard.innerHTML = "";
		console.log("초기화 완료 (운동, 세트)");
	};

	/** 결과 표시 - 결과 객체를 받아 HTML 문자열로 조립하고 resultCard에 삽입 */

	RandomBodybuildingApp.prototype.displayResult = function (result) {
		// 결과 객체를 받아 HTML 문자열로 조립하고 `resultCard`에 삽입

		var exercises = result.exercises;
		var set = result.set;
		var pose = result.pose;

		this.resultCard.classList.add("visible");
		var html = "";

		if (exercises && exercises.length > 0) {
			html +=
				'<div class="result-section">' +
				'<div class="result-label">🏋️ 운동 종목</div>' +
				'<ul class="exercise-list">';

			exercises.forEach(function (ex) {
				html += "<li>✅ " + escapeHTML(ex) + "</li>";
			});

			html += "</ul></div>";
		}

		if (set) {
			html +=
				'<div class="result-section">' +
				'<div class="result-label">🔄 세트</div>' +
				'<div class="set-pose-item">📌 ' +
				escapeHTML(set) +
				"</div>" +
				"</div>";
		}

		if (pose) {
			html +=
				'<div class="result-section">' +
				'<div class="result-label">📷 포징 모음</div>' +
				'<div class="set-pose-item">🤸 ' +
				escapeHTML(pose) +
				"</div>" +
				"</div>";
		}

		this.resultCard.innerHTML = html;
		console.log("결과 표시:", result);
	};

	/** 남은 종목·세트 개수를 배지에 표시 */
	RandomBodybuildingApp.prototype.updateRemainingDisplay = function () {
		var remainingEx = this.exercisePool.getRemainingCount();
		var remainingSet = this.setPool.getRemainingCount();

		this.remainingSpan.textContent = remainingEx;
		this.remainingSetsSpan.textContent = remainingSet;

		console.log(
			"남은 종목: " + remainingEx + ", 남은 세트: " + remainingSet,
		);
	};

	/** 편집 모달 열기 - textarea에 현재 풀 항목을 채우고 모달 표시 */

	RandomBodybuildingApp.prototype.openEditModal = function () {
		this.editExercisesTA.value = this.exercisePool.items.join("\n");
		this.editSetsTA.value = this.setPool.items.join("\n");
		this.editPosesTA.value = this.posePool.items.join("\n");
		this.editModal.style.display = "flex";

		console.log("편집 모달 열기");
	};

	/** 편집 모달 닫기 */
	RandomBodybuildingApp.prototype.closeEditModal = function () {
		this.editModal.style.display = "none";
		console.log("편집 모달 닫기");
	};

	/** `<textareas>`를 파싱 → 빈 줄 제거 → 유효성 검사 → 풀에 저장 → 화면 갱신 */
	RandomBodybuildingApp.prototype.saveEditChanges = function () {
		var exLines = this.parseTextareaLines(this.editExercisesTA);
		var setLines = this.parseTextareaLines(this.editSetsTA);
		var poseLines = this.parseTextareaLines(this.editPosesTA);

		if (exLines.length === 0) {
			alert("운동 종목을 하나 이상 입력해야 합니다.");
			return;
		}

		this.exercisePool.setItems(exLines);
		this.setPool.setItems(setLines);
		this.posePool.setItems(poseLines);

		this.updateRemainingDisplay();
		this.resultCard.classList.remove("visible");

		this.resultCard.innerHTML = "";

		this.closeEditModal();
		console.log("목록 편집 저장 완료");
	};

	/**
	 * 뽑기를 시도하기 전에 세트·종목 잔여량을 검증합니다.
	 * includeSet이 true이면 세트 잔여량도 함께 확인합니다.
	 * 검증을 통과하면 true, 아니면 alert를 띄우고 false를 반환합니다.
	 */
	RandomBodybuildingApp.prototype.validateDraw = function (includeSet) {
		if (includeSet && this.setPool.getRemainingCount() === 0) {
			alert(
				"더 이상 뽑을 세트가 없습니다. 초기화하거나 목록을 편집해 주세요.",
			);
			return false;
		}

		var count = this.getDrawCount();

		if (this.exercisePool.getRemainingCount() < count) {
			alert(
				"남은 종목이 " +
					this.exercisePool.getRemainingCount() +
					"개뿐입니다. 개수를 줄이거나 초기화해 주세요.",
			);
			return false;
		}

		return true;
	};

	/**
	 * 텍스트 영역의 내용을 주어진 기본값 배열로 되돌립니다.
	 */
	RandomBodybuildingApp.prototype.restoreDefaults = function (
		textarea,
		defaults,
	) {
		textarea.value = defaults.join("\n");
	};

	/**
	 * 텍스트 영역의 내용을 줄 단위로 파싱하여
	 * 앞뒤 공백이 제거된 빈 줄이 없는 문자열 배열로 반환합니다.
	 */
	RandomBodybuildingApp.prototype.parseTextareaLines = function (textarea) {
		return textarea.value
			.split("\n")
			.map(function (line) {
				return line.trim();
			})
			.filter(function (line) {
				return line.length > 0;
			});
	};

	/** 운동 목록을 기본값으로 복원 */
	RandomBodybuildingApp.prototype.resetExercisesToDefault = function () {
		this.restoreDefaults(this.editExercisesTA, DEFAULT_EXERCISES);
		console.log("운동 기본값 복원");
	};

	/** 세트 목록을 기본값으로 복원 */
	RandomBodybuildingApp.prototype.resetSetsToDefault = function () {
		this.restoreDefaults(this.editSetsTA, DEFAULT_SETS);
		console.log("세트 기본값 복원");
	};

	/** 포즈 목록을 기본값으로 복원 */
	RandomBodybuildingApp.prototype.resetPosesToDefault = function () {
		this.restoreDefaults(this.editPosesTA, DEFAULT_POSES);
		console.log("포징 기본값 복원");
	};

	// ---------- 앱 시작 ----------
	var app = new RandomBodybuildingApp();
	// 테스트 용이성을 위해 전역 노출 (개발자 도구에서 접근 가능)
	window.__app = app;
})();
