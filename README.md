# Minkyoung Kim — Artist Portfolio

Nuxt 3 기반의 정적 작가 포트폴리오입니다. 기본 언어 전체 데이터와 동일 구조의 언어별 JSON을 사용하며, Decap CMS에서 언어별 전체 데이터를 관리합니다.

새 프로젝트의 필수 원칙은 `SITE_PRINCIPLES.md`, 복사해서 수정할 초기값은 `site-bootstrap.config.json`에 있습니다.

## 로컬 실행

```bash
corepack enable
pnpm install
pnpm dev
```

콘텐츠 검증과 정적 빌드:

```bash
pnpm validate
pnpm export:content
pnpm generate
```

기본 언어는 `content/data/ko.json`, 영어는 동일한 키 구조의 `content/data/en.json`입니다. 검증기는 JSON 문법, 재귀 키 구조, 배열 ID 집합과 자료형을 확인합니다. 빌드 시 `/data/{locale}.json`과 `/data/{locale}.csv`를 생성합니다.

`NUXT_PUBLIC_SITE_URL`에는 실제 배포 도메인을 지정합니다.

## 작품 이미지

업로드 권장 정책은 JPG/JPEG/PNG/WebP, 긴 변 2048px 이하, 1MB 이하, WebP 우선, EXIF 제거, 확대 금지입니다. `utils/imageOptimizer.ts`와 `public/admin/image-widget.js`는 향후 커스텀 위젯 연결을 위한 인터페이스이지만 현재 Decap CMS에는 등록하지 않았습니다. 따라서 CMS 업로드 전에 별도 이미지 도구로 최적화해야 합니다. 현재 JSON의 작품·프로필·News 이미지 경로는 실제 이미지로 교체해야 하는 샘플입니다.

## Netlify

현재 프로젝트는 Identity와 Git Gateway를 사용하는 기존 Decap 구성을 유지합니다. Git Gateway는 신규 구성에 권장되지 않는 deprecated 기능이므로 새 프로젝트에서는 인증 방식을 다시 결정해야 합니다.

GitHub 비공개 저장소를 Netlify에 연결하면 `netlify.toml`의 `pnpm generate`와 `.output/public` 설정을 사용합니다. Identity를 활성화한 뒤 Git Gateway를 켜고 `/admin/`에서 초대된 사용자로 로그인합니다.

관리자 계정은 Netlify에서 Identity를 활성화하고 Registration을 **Invite only**로 설정한 뒤 Git Gateway를 켜서 구성합니다. 작가 이메일을 초대하고 비밀번호 설정을 마치면 `/admin/`으로 접속할 수 있습니다. 프로젝트에는 자체 인증이나 공개 회원가입 기능이 없습니다.

## 정적 문의 방식

Contact는 서버나 데이터베이스 없이 `mailto:`, 이메일 복사, 선택적 SNS·전화·지도 링크만 사용합니다. 향후 문의 폼이 필요하면 Netlify Forms를 별도 도입할 수 있으며, 현재는 존재하지 않는 전송 API를 포함하지 않습니다.
