import { X } from 'lucide-react';

const ComparePage = () => {
  return (
    <div className="flex flex-row min-h-dvh relative">
      {/* 왼쪽 50% - 그라데이션 */}
      <div className="absolute left-0 top-0 w-1/2 h-full bg-linear-to-b from-[#F2EEEB] via-[#CFCCFF] to-[#D1DFD3]"></div>

      {/* 오른쪽 50% - 그라데이션 */}
      <div className="absolute right-0 top-0 w-1/2 h-full bg-linear-to-b from-[#F2EEEB] via-[#EECFD3] to-[#E7DDE3]"></div>

      {/* 좌측 md이상 */}
      <section className="hidden md:flex flex-1 flex-col relative text-black items-center pt-4">
        <X width={34} height={34} strokeWidth={1} />
        <div className="flex flex-col gap-2 text-center pt-4">
          <h3 className="text-[18px] font-bold">
            한남하이츠아파트 주택재건축정비사업조합
          </h3>
          <p className="text-xl font-thin">성동구 옥수동</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">48837.5 m2</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">48837.5 m2</p>
          </div>
        </div>

        <h3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-extrabold">
          28<span className="font-light">%</span>
        </h3>
      </section>

      {/* 좌측 모바일 */}
      <div className="absolute md:hidden flex flex-col text-black items-center pt-4 top-0 left-0 w-1/2 h-[300px] z-20">
        <X width={34} height={34} strokeWidth={1} />
        <div className="flex flex-col gap-2 text-center pt-4 w-full">
          <h3 className="text-[18px] font-bold truncate ">
            한남하이츠아파트 주택재건축정비사업조합
          </h3>
          <p className="text-xl font-thin">성동구 옥수동</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">48837.5 m2</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">48837.5 m2</p>
          </div>
        </div>
      </div>

      {/* 메인 비교 */}
      <section className="flex-1 flex flex-col items-center justify-center relative z-10 text-black md:px-0 px-4">
        {/* Top Line with 위치 */}
        <div className="md:mt-20 mt-28 w-full flex items-center justify-center">
          <div className="w-full relative">
            <div className="h-px bg-black md:w-full w-0"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white rounded-full md:w-[60px] md:h-[60px] w-10 h-10 flex items-center justify-center text-sm font-normal">
              위치
            </div>
          </div>
        </div>

        {/* 면적 Bubble */}
        {/* Todo : 면적도 계산할 수 있으면 계산 (가능할 듯?) */}
        <div className="relative flex w-full h-[250px]">
          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10 ">
            <div
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-radial-[at_75%_30%] from-white/70 to-[#E2D2E0] to-90% transition-all duration-500 rounded-l-full"
              style={{ width: `${250 / 2}px`, height: `${250}px` }} // 왼쪽 비율
            />
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10 ">
            <div
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-radial-[at_30%_25%] from-white/10 to-[#268F79]/30 to-90% transition-all duration-500 rounded-r-full"
              style={{ width: `${150 / 2}px`, height: `${150}px` }} // 왼쪽 비율
            />
          </div>
          <div className="rounded-full flex items-center justify-center mx-auto">
            <span className="text-sm font-normal text-black">면적</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center w-full max-w-4xl gap-2">
          {/* 가격 비교 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-xl font-semibold">26~50억</span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm font-normal shrink-0">
              가격
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-xl font-semibold">10~20억</span>
            </div>
          </div>

          {/* 평균 대지지분 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-4xl font-bold">
                26.19<span className="text-xl">평</span>
              </span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm font-normal text-center shrink-0">
              평균
              <br />
              대지지분
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-4xl font-bold">
                29.92<span className="text-xl">평</span>
              </span>
            </div>
          </div>

          {/* 소유자 수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${71}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${54}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>71%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">564명</span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm">
                소유자 수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">2,647명</span>
              </div>
              <span>54%</span>
            </div>
          </div>

          {/* 조합원 분양수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${71}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${81}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>71%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">564세대</span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm">
                조합원
                <br />
                분양수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">
                  2,647세대
                </span>
              </div>
              <span>81%</span>
            </div>
          </div>

          {/* 일반 분양수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${28}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>28%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">223세대</span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm text-center">
                일반
                <br />
                분양수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">223세대</span>
              </div>
              <span>81%</span>
            </div>
          </div>

          {/* 임대 세대수 */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${17}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>17%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">223세대</span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-sm whitespace-normal break-keep text-center">
                임대
                <br />
                세대수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">223세대</span>
              </div>
              <span>81%</span>
            </div>
          </div>

          {/* 신축 총 세대수 */}
          {/* Todo : 신축 총 세대수 계산 해야함. */}
          <div className="relative w-full">
            <div className="relative z-10 flex items-center w-full">
              {/* 퍼센트 배경 — 왼쪽 절반 */}
              <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 right-0 bg-[#61616C] transition-all duration-500 rounded-l-4xl"
                  style={{ width: `${100}%` }} // 왼쪽 비율
                />
              </div>

              {/* 퍼센트 배경 — 오른쪽 절반 */}
              <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden -z-10">
                <div
                  className="absolute inset-y-0 left-0 bg-[#61616C] transition-all duration-500 rounded-r-4xl"
                  style={{ width: `${0}%` }} // 오른쪽 비율
                />
              </div>

              {/* 위에 올리는 실제 콘텐츠 */}
              <span>17%</span>
              <div className="flex items-center justify-end gap-2 flex-1 pr-4">
                <span className="text-base font-thin text-white">223세대</span>
              </div>

              {/* 가운데 동그라미 */}
              <div className="bg-black text-white rounded-full w-[70px] h-[70px] flex items-center justify-center text-sm whitespace-normal break-keep text-center">
                신축
                <br />총 세대수
              </div>

              <div className="flex items-center gap-2 flex-1 pl-4">
                <span className="text-base font-thin text-white">223세대</span>
              </div>
              <span>81%</span>
            </div>
          </div>

          {/* 신축용적률 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">26~50억</span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              신축
              <br />
              용적률
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">265.67%</span>
            </div>
          </div>

          {/* 현재단계 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">
                사업시행인가
              </span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              현재단계
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">265.67%</span>
            </div>
          </div>

          {/* 사업성격 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">재개발</span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              사업성격
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">265.67%</span>
            </div>
          </div>

          {/* 시행주체 */}
          <div className="flex items-center w-full">
            <div className="flex-1 text-right pr-4">
              <span className="text-base font-thin text-black">조합</span>
            </div>
            <div className="bg-black text-white rounded-full w-[60px] h-[60px] flex items-center justify-center text-center text-sm font-normal shrink-0 whitespace-normal break-keep">
              시행주체
            </div>
            <div className="flex-1 text-left pl-4">
              <span className="text-base font-thin text-black">265.67%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 좌측 md이상 */}
      <section className="hidden md:flex flex-1 flex-col relative text-black items-center pt-4">
        <X width={34} height={34} strokeWidth={1} />
        <div className="flex flex-col gap-2 text-center pt-4">
          <h3 className="text-[18px] font-bold">
            한남하이츠아파트 주택재건축정비사업조합
          </h3>
          <p className="text-xl font-thin">성동구 옥수동</p>
        </div>
        <div className="flex flex-col gap-3 pt-[60px]">
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">정비구역 면적</p>
            <p className="text-xl font-thin">48837.5 m2</p>
          </div>
          <div className="flex flex-col text-center">
            <p className="text-sm font-extrabold">택지 면적</p>
            <p className="text-xl font-thin">48837.5 m2</p>
          </div>
        </div>

        <h3 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl font-extrabold">
          28<span className="font-light">%</span>
        </h3>
      </section>
    </div>
  );
};

export default ComparePage;
