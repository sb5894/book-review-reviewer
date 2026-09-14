# 서평 고쳐쓰기

학교에서 이어서 진행할 때: [학교 테스트 및 Codex 인수인계](docs/SCHOOL-TEST-HANDOFF.md) — 2026-09-14 연결 상태, 손글씨 시험 원고, 체크리스트, 출석번호 변경 예정 사항.

종이에 쓴 서평을 사진으로 올려 첫 고쳐쓰기 안내를 받고, 두 번째 고쳐쓰기는 교사와 진행하는 교실 앱입니다. 학생용 채팅창이나 대필 기능은 없습니다.

## 기능
- 출석번호 1~26번 접속. HTTP-only 기기 세션으로 각 제출물 접근을 분리합니다.
- 카메라/파일 업로드, 최대 4쪽, 회전 메타데이터 반영·축소·재인코딩. 사진별 ‘사진 돌리기’로 90도씩 방향을 바꾼 뒤 업로드합니다.
- 왼쪽 사진과 오른쪽 피드백 카드. OCR 줄 좌표로 카드·밑줄·번호를 연결합니다.
- Google Cloud Vision DOCUMENT_TEXT_DETECTION과 Vertex AI Gemini를 분리합니다.
- 지도서 다섯 요소, 빠진 요소 모두 표시 + 자세한 내용 안내 최대 1개 + 확실한 표기 오류 모두 표시. 모호한 판단은 교사에게 넘깁니다.
- OCR 신뢰도와 원문 일치 검증. 인식 불확실 시 사진 재촬영 또는 또박또박 쓰기 안내.
- 교사 로그인, 전체 제출물 확인, 도움 요청, 교사 메모, 사진 접수 열기/닫기, 제출물 삭제.
- 예시 체험은 고정된 가상 예시임을 표시합니다. 자격증명이 없으면 실제 분석을 가장하지 않습니다.

## 기술
React 19 / TypeScript / Vinext / Cloudflare Workers / D1 / R2. 교사 로그인은 Sites가 제공하는 ChatGPT sign-in을 사용합니다. 클라이언트의 교사 플래그나 출석번호로 권한을 부여하지 않습니다.

## 로컬 실행
Node 22.13 이상, 테스트에는 Node 24 권장.

```sh
npm run install:ci
cp .env.example .env
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_outgoing_exodus.sql
npm run dev
```

PowerShell에서는 `Copy-Item .env.example .env`를 사용합니다. 이 환경의 npm shim 문제가 재현되면 `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run build`처럼 실제 npm 엔트리포인트로 실행합니다.

로컬 서버: http://localhost:5173. `/signin-with-chatgpt?return_to=/teacher`는 starter의 루프백 전용 시험 로그인을 사용합니다. 이 개발 로그인은 프로덕션에 포함되지 않습니다.

## Google Cloud 연결
1. 사용할 프로젝트의 크레딧 종류·유효기간·Vision 및 Vertex 사용 자격을 Cloud Billing에서 확인합니다. 무료 체험 크레딧이 AI Studio/Gemini Developer API에 적용된다고 가정하지 않습니다.
2. Cloud Vision API와 Vertex AI API를 활성화합니다.
3. 프로젝트에서 전용 서비스 계정을 만들고 필요한 범위의 `Vertex AI User` 및 `Service Usage Consumer` 권한을 부여합니다. 이 앱은 이미지 바이트를 직접 보내므로 사용자 Cloud Storage 버킷 권한은 필요하지 않습니다.
4. 조직이 허용하는 경우 서비스 계정 JSON을 서버 비밀 설정 `GOOGLE_SERVICE_ACCOUNT_JSON`으로 등록합니다. 채팅·Git·프런트엔드에 키를 넣지 않습니다. 조직에서 키 발급을 금지하면 정책을 우회하지 말고 별도의 자격증명 연동을 구성해야 합니다.
5. 선택 설정: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION=global`, `VERTEX_MODEL=gemini-2.5-flash`.
6. 로컬 값은 ignored `.env`, 호스팅 값은 Sites secret으로 관리합니다. Cloud 서비스 활성화나 권한 부여를 앱이 자동으로 수행하지 않습니다.

실제 OCR 정확도와 피드백 품질은 연결 후 교사가 제공하는 비식별 손글씨로 확인해야 합니다. 신뢰도 수치와 사진 좌표는 완벽한 정확성 보장이 아닙니다. 지원 종료되는 모델은 서버 설정으로 바꿀 수 있습니다.

## 검증
```sh
node node_modules/typescript/bin/tsc --noEmit
node --test tests/feedback.test.ts
node scripts/api-check.mjs
npm run build
```
`api-check`는 로컬 서버와 마이그레이션이 필요하며, 로컬 시험 교실을 만듭니다. 외부 AI를 호출하거나 실제 학생 자료를 보내지 않습니다. 실제 서비스 계정이 연결된 환경에서는 사용하지 마세요.

## 배포 / 교사 계정
`.openai/hosting.json`의 D1 `DB`, R2 `BUCKET` 바인딩으로 배포합니다. 최초 사이트는 소유자 전용입니다. 소유자가 `/teacher`에서 교실을 만든 뒤 학생 방문을 허용하는 접근 설정으로 변경해야 출석번호만으로 접속할 수 있습니다. 설정 전의 최초 계정이 교사가 되는 부트스트랩 흐름이므로 초기 설정 전에 사이트를 공개하지 마세요.

Sites 외 환경에서는 신뢰할 수 있는 인증 프록시가 없는 한 `oai-authenticated-user-*` 헤더를 인증에 사용하면 안 됩니다. 대체 호스팅에는 교사 인증 어댑터를 먼저 구현해야 합니다.

GitHub 저장소의 코드는 앱 소스입니다. 사진·DB·환경 비밀값을 포함하지 않습니다. 실제 분석을 켜려면 Google Cloud 연결과 손글씨 시험이 추가로 필요합니다.

자세한 수업 운영: [교사 안내](docs/TEACHER-GUIDE.md).

공식 참고: [Vision 손글씨 인식](https://docs.cloud.google.com/vision/docs/handwriting), [Vertex 생성 API](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference), [서비스 계정 인증](https://developers.google.com/identity/protocols/oauth2/service-account).
