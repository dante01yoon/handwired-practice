# Handwired 실습 자료

영상에서 실행한 공식 저장소의 고정 버전과 작은 관찰 도구입니다. 별도 프롬프트 웹 화면은 필요하지 않습니다. Git, Node.js/npm이 있는 터미널에서 시작합니다. 직접 설치한 Bun 1.4.3이 있다면 `npx --yes bun@1.4.3` 대신 `bun`을 사용할 수 있습니다.

```sh
git clone https://github.com/chenglou/handwired.git
cd handwired
git checkout 257856e3b221140acb4cc4460626b850c0bd4ff1
npx --yes bun@1.4.3 install --frozen-lockfile
npx --yes bun@1.4.3 test template
npx --yes bun@1.4.3 run start:template
```

터미널에 출력된 localhost 주소를 브라우저에서 엽니다. 포트가 사용 중이면 서버를 종료한 뒤 다른 포트를 지정합니다. macOS/Linux는 `PORT=3019 npx --yes bun@1.4.3 run start:template`, PowerShell은 `$env:PORT=3019`를 먼저 실행한 뒤 서버 명령을 실행합니다. 종료는 Ctrl+C입니다. 이 제작에서는 macOS/Bun 1.4.3으로 실행했습니다.

## 파일을 읽는 순서

- `template/toggle.ts`: 입력과 상태를 선언하고 숫자 프로그램을 구성합니다.
- `template/toggle-reference.ts`: 같은 동작을 보통 JavaScript로 구현한 비교 대상입니다.
- `template/toggle.test.ts`: 같은 입력을 두 구현에 주고 상태·위치·허용 오차를 비교합니다.
- `template/main.ts`, `template/index.html`: 브라우저 페이지와 실제 DOM을 연결합니다.
- `docs/tutorial.md`: 빌더와 호스트 루프를 순서대로 설명합니다.

`inspect-toggle.ts`를 위에서 받은 공식 저장소의 루트, 즉 package.json 옆에 복사합니다. 이 파일은 새 모델을 학습하지 않고 기존 토글의 연산 수와 간단한 산술 예제, 입력 간격 검사를 출력하는 보조 도구입니다.

```sh
npx --yes bun@1.4.3 inspect-toggle.ts
```

## 관찰 과제

1. a=3,4,5,6,4.5에서 산술 예제와 JavaScript 조건문의 답을 비교하세요.
2. 토글 안에서 누르고 밖에서 놓을 때 상태가 바뀌는지 확인하세요.
3. 테스트 파일에서 정확히 같아야 하는 값과 허용 오차를 쓰는 값을 찾아보세요.

정답은 `ANSWERS.md`, 원문은 `SOURCES.md`에 있습니다. 공식 코드의 MIT 라이선스 사본을 함께 넣었습니다.

## ComfyUI 에셋으로 직접 만든 갤러리

동봉 `comfy-gallery` 폴더를 위에서 내려받은 공식 저장소의 루트(package.json 옆)에 복사합니다. 폴더 구조는 `handwired/comfy-gallery/program.ts`와 `handwired/src/runtime/`입니다. 이미지 6개는 기존 Comfy Cloud 영화의 입력과 생성 장면입니다.

- `program.ts`: Handwired 입력 셀, 사진 좌표·크기, 필터와 클릭 판정을 구성합니다. `reference` 함수는 일반 JavaScript 비교 구현입니다.
- `test.ts`: 폭·간격·열·필터와 테두리 주변 포인터를 바꿔 2,304개 입력과 82,944개 출력값을 비교합니다. 실패하면 종료 코드 1입니다.
- `main.ts`: 실제 브라우저 입력을 모으고 계산 결과를 DOM에 그립니다.
- `index.html`: 조작 화면입니다. `serve.ts`는 로컬 서버를 엽니다.
- `assets/`와 `assets.json`: 데모 이미지와 표시 이름입니다. `results/test-results.json`은 검사를 실행할 때 갱신됩니다.

파일을 복사했으면 해당 폴더에서 실행합니다. macOS와 Windows PowerShell 명령이 같습니다.

```sh
cd comfy-gallery
npx --yes bun@1.4.3 test.ts
npx --yes bun@1.4.3 serve.ts
```

브라우저에서 http://127.0.0.1:3031 을 엽니다. 2열/3열, 간격 16/32px, 제품/스토리 필터를 바꾸고 사진을 눌러 보세요. 오른쪽 좌표·크기·클릭 결과는 Handwired 출력입니다. ‘비교 테스트 결과 열기’는 터미널에서 생성한 보고서를 읽습니다. 서버는 Ctrl+C로 종료합니다.

추가 과제: 필터로 흐려진 에셋을 클릭했을 때 선택되는지 확인하세요. 정답은 선택 없음입니다. 이미지 생성과 UI 동작 계산을 연결한 예제이며, 클릭 판정은 정확한 비트 비교, 좌표는 0.001픽셀 허용 오차로 검사합니다. macOS에서 직접 실행했으며 Windows 실행은 미검사입니다.

## 콘텐츠에 따라 카드 너비 제안하기

같은 `comfy-gallery` 폴더에서 서버를 실행하고 http://127.0.0.1:3031/adaptive 를 엽니다. 공식 `lab/reusable-layout/model.json`의 학습된 계수 121개를 재사용합니다. 사진 비율·측정한 설명 길이·중요도·화면 폭 등 8개 입력으로 선호 너비를 계산하고, 실제 줄바꿈·DOM 배치·PNG 출력은 JavaScript가 처리합니다.

1. 기본 620px 화면에서 텀블러 중요도를 높여 보세요. 너비가 약 206.9px에서 293.0px로 바뀝니다. 왼쪽 고정 너비는 224px입니다.
2. 설명을 길게 바꾸고 화면 폭을 420/900/1180px로 바꿔 사진 6개와 설명이 유지되는지 확인합니다.
3. ‘16가지 조건 검사’를 누르면 고정 너비·공유 규칙·매번 탐색 방식 48배치, 288카드를 검사합니다. 누락·설명/가로 넘침·겹침이 있으면 FAIL입니다.
4. ‘JSON 저장’은 실제 위치·크기·설명 줄을 저장합니다. ‘PNG 저장’은 현재 배치의 에셋 목록 이미지를 저장합니다. 영상에서 저장한 두 파일은 `results/`에 있습니다.

```sh
npx --yes bun@1.4.3 test-adaptive.ts
```

`adaptive.ts`가 실제 화면 입력과 공식 규칙을 연결합니다. `adaptive-assets.json`에는 사진 비율·설명이 있으며, `test-adaptive.ts`는 브라우저에서 실제 측정해 동봉한 Arial 14px 단어 너비로 검사를 재현합니다. 브라우저에서는 실행 환경의 실제 Arial을 매번 측정하므로 폰트 대체 시 수치가 달라질 수 있습니다.

배치 점수는 중요도에 맞는 면적·설명 3줄 초과·행의 빈 공간이라는 작성된 기준입니다. 공유 규칙은 16조건 중 12조건에서 고정 너비보다 점수가 낮았고, 낮은 중요도+긴 설명 4조건은 더 높았습니다. 실제 서비스에서는 실패 사례와 원하는 배치 기준을 학습 데이터에 반영하는 방향으로 응용할 수 있습니다. 새 모델 학습과 상용 서비스 적용은 이 예제의 실행 범위에 포함하지 않았습니다.

관찰 과제: 같은 사진에서 중요도만 바꾸었을 때 고정 배치와 공유 규칙이 각각 어떻게 반응하나요? 정답은 고정 배치 224px 유지, 공유 규칙의 텀블러 너비 변경입니다. PNG에는 사진의 전체 영역과 줄바꿈된 설명이 모두 저장되어야 합니다.
