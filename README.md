# Weather App

대한민국 행정구역 검색과 현재 위치 기반 조회를 지원하는 날씨 앱입니다.  
모바일 날씨앱처럼 한 화면 안에서 위치를 빠르게 전환하고, 현재 기온과 당일 최저/최고 기온, 시간대별 기온을 확인할 수 있도록 구현했습니다.

## 주요 기능

- 앱 첫 진입 시 브라우저 현재 위치 감지
- 현재 위치 기준 날씨 조회
- `korea_districts.json` 기반 대한민국 행정구역 검색
- 시/군/구/동 단위 keyword 자동완성 검색
- 선택한 장소 기준 날씨 조회
- 현재 기온, 당일 최저/최고 기온, 시간대별 기온 표시
- 날씨 코드 기반 CSS 아이콘 표시
- 즐겨찾기 최대 6개 등록
- 즐겨찾기 추가, 삭제, 별칭 수정
- `localStorage` 기반 즐겨찾기 persist
- 모바일 우선 반응형 UI
- 로딩, 에러, 빈 상태 UI 처리

## 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성합니다.

```env
NEXT_PUBLIC_WEATHER_API_BASE_URL=https://api.open-meteo.com/v1
NEXT_PUBLIC_GEOCODING_API_BASE_URL=https://geocoding-api.open-meteo.com/v1
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```txt
http://localhost:3000
```

### 4. 빌드

```bash
npm run build
```

## 기술 스택

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Framer Motion
- Open-Meteo Weather API
- Open-Meteo Geocoding API
- Nominatim Reverse Geocoding

## 프로젝트 구조

Feature-Sliced Design 구조를 기준으로 관심사를 분리했습니다.

```txt
src/
  app/        # App Router, layout, provider
  widgets/    # 화면 단위 조합 UI
  features/   # 사용자 행동 중심 기능
  entities/   # 도메인 모델과 상태
  shared/     # 공용 API, config, UI
```

주요 모듈:

- `entities/location`: 행정구역 데이터 파싱, 검색, 포맷팅
- `entities/weather`: 날씨 API 조회, query key, TanStack Query hook
- `entities/favorite`: 즐겨찾기 상태 관리와 persist
- `features/current-location`: 현재 위치 감지
- `features/location-search`: 검색 keyword와 debounce 처리
- `widgets/weather-dashboard`: 메인 날씨 화면 UI
- `shared/api`: fetch 기반 API client와 좌표 조회 함수
- `shared/ui`: glass card, weather glyph 등 공용 UI

## 구현 상세

### 위치 검색

제공된 `korea_districts.json`을 기반으로 행정구역을 검색합니다.  
`서울특별시`, `종로구`, `청운동`처럼 시/도, 시/군/구, 읍/면/동 단위 keyword 검색이 가능하도록 공백과 하이픈을 정규화했습니다.

JSON 원본에 중복 행정구역이 포함될 수 있어, 앱 내부에서는 `code` 기준으로 중복을 제거한 뒤 검색 결과를 렌더링합니다.

### 좌표 변환

장소 선택 후 날씨 API를 호출하기 위해 주소를 좌표로 변환합니다.

1. Open-Meteo Geocoding API로 좌표 조회
2. 결과가 없으면 Nominatim search API로 fallback

한국의 구/동 단위 주소는 Open-Meteo에서 누락되는 경우가 있어 fallback을 추가했습니다.

### 현재 위치

브라우저 Geolocation API를 사용해 현재 위치 좌표를 가져옵니다.  
좌표를 가져온 뒤 Nominatim reverse geocoding으로 사용자에게 보여줄 주소명을 구성합니다.

권한 거부, 위치 조회 실패, timeout 상황은 별도 메시지로 처리합니다.

### 날씨 데이터

Open-Meteo Weather API를 사용해 아래 데이터를 조회합니다.

- 현재 기온
- 현재 날씨 코드
- 당일 최저 기온
- 당일 최고 기온
- 시간대별 기온

TanStack Query를 사용해 서버 상태를 관리하며, query key는 좌표 기반으로 구성했습니다.

```ts
["weather", "forecast", { lat, lon }]
```

### 즐겨찾기

Zustand로 즐겨찾기 상태를 관리합니다.

- 최대 6개 제한
- 중복 장소 등록 방지
- 별칭 수정
- 삭제
- `localStorage` persist

즐겨찾기 카드를 선택하면 별도 페이지 이동 대신 메인 날씨 영역이 해당 장소 기준으로 전환됩니다. 모바일 날씨앱에서 장소를 빠르게 바꾸는 경험을 우선해 단일 화면 전환 방식으로 구성했습니다.

## 기술적 의사결정

### FSD 구조 사용

도메인 로직과 UI 조합을 분리하기 위해 FSD 구조를 사용했습니다.  
날씨, 위치, 즐겨찾기는 `entities`에 두고, 현재 위치 감지와 검색 상태처럼 사용자 행동에 가까운 로직은 `features`로 분리했습니다.

### TanStack Query 사용

날씨 데이터는 좌표에 따라 달라지는 서버 상태이므로 TanStack Query로 관리했습니다.  
좌표를 query key에 포함해 위치가 바뀔 때 자동으로 새로운 날씨 데이터를 가져오도록 했습니다.

### Zustand 사용

즐겨찾기는 서버 상태가 아니라 클라이언트 앱 상태이므로 Zustand를 사용했습니다.  
persist middleware를 통해 localStorage 저장을 간단하게 처리했습니다.

### 단일 화면 중심 UX

과제 요구에는 상세 페이지 이동이 포함되어 있지만, 모바일 날씨앱 사용성 관점에서는 별도 라우팅보다 한 화면에서 장소를 전환하는 방식이 더 자연스럽다고 판단했습니다.  
따라서 즐겨찾기 카드를 누르면 현재 화면의 날씨 정보가 선택 장소 기준으로 업데이트되도록 구현했습니다.

### CSS 기반 날씨 아이콘

별도 이미지 asset 없이 API의 `weather_code`를 기반으로 CSS 날씨 아이콘을 렌더링했습니다.  
맑음, 구름, 비, 눈, 안개, 뇌우 상태를 부드러운 glassmorphism UI 톤과 맞추는 데 집중했습니다.

### Turbopack 비활성화

개발 중 `.next` manifest 관련 dev server 오류가 반복되어 안정적인 로컬 개발 환경을 위해 기본 Next dev/build 명령을 사용했습니다.

## UI 방향

- 모바일 우선 디자인
- 데스크탑에서는 중앙 정렬된 앱 형태
- 부드러운 하늘색, 보라색, 남색 계열 그라데이션
- glassmorphism 카드 UI
- 큰 현재 기온 중심 구성
- Framer Motion 기반 진입/카드 애니메이션
- 320px 화면에서도 깨지지 않도록 텍스트 줄바꿈과 가로 스크롤 처리

## 제한 사항

- 위치명 표시와 주소 좌표 변환은 외부 geocoding API 응답 품질에 영향을 받습니다.
- 일부 작은 행정구역은 정확한 중심 좌표가 아닌 근처 대표 좌표로 조회될 수 있습니다.
- 날씨 데이터는 Open-Meteo API 기준이며, 국내 기상청 관측값과 차이가 있을 수 있습니다.
