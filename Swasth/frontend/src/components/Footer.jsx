import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">

      {/* MAIN FOOTER */}

      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">

          {/* BRAND */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0757c9] text-lg font-black text-white">
                SQ
              </div>

              <div>

                <h2 className="text-lg font-black text-slate-900">
                  Swasth QR
                </h2>

                <p className="text-xs font-medium text-slate-400">
                  Smart OPD Management
                </p>

              </div>

            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-slate-500">
              A simple digital platform for finding doctors,
              booking OPD appointments, getting tokens and
              tracking your queue without unnecessary waiting.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              Smart healthcare workflow

            </div>

          </div>

          {/* QUICK LINKS */}

          <div>

            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Quick Links
            </h3>

            <div className="mt-4 space-y-3">

              <Link
                to="/"
                className="block text-sm font-medium text-slate-500 transition hover:text-[#0757c9]"
              >
                Home
              </Link>

              <Link
                to="/patient"
                className="block text-sm font-medium text-slate-500 transition hover:text-[#0757c9]"
              >
                My Queue
              </Link>

            

              <Link
                to="/doctor"
                className="block text-sm font-medium text-slate-500 transition hover:text-[#0757c9]"
              >
                Doctor Dashboard
              </Link>

            </div>

          </div>

          {/* FEATURES */}

          <div>

            <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
              Swasth QR
            </h3>

            <div className="mt-4 space-y-3">

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-green-600">
                  ✓
                </span>
                Doctor availability
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-green-600">
                  ✓
                </span>
                OPD appointment booking
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-green-600">
                  ✓
                </span>
                Automatic token generation
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-green-600">
                  ✓
                </span>
                Live queue tracking
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="text-green-600">
                  ✓
                </span>
                QR based check-in
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}

      <div className="border-t border-slate-100">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Swasth QR. All rights reserved.
          </p>

          <div className="flex items-center gap-4">

            <span className="text-xs font-medium text-slate-400">
              Digital healthcare, made simpler.
            </span>

            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

            <span className="text-xs font-semibold text-[#0757c9]">
              Swasth QR #
            </span>

          </div>

        </div>

      </div>

    </footer>
  );
}