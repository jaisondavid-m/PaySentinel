import React from 'react';
import { usePolicy } from '../../context/PolicyContext';
import { FileText, Shield, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

export default function UserSecurityLogs() {
  const { auditLogs } = usePolicy();

  return (
    <div className="max-w-4xl space-y-6 font-sans text-[#171923]">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5F3FF] text-[#7D53F6] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#171923]">Security Audit Trail & Logs</h2>
            <p className="text-xs text-[#667085] mt-0.5 font-medium">
              Immutable timeline of every agent payment request, policy evaluation, and decision trigger.
            </p>
          </div>
        </div>
      </div>

      {/* TIMELINE VIEW */}
      <div className="bg-white rounded-2xl p-6 border border-[#E6E8F0] shadow-2xs space-y-6">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-[#667085] text-xs">
            No security audit events recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-[#E6E8F0] space-y-6">
            {auditLogs.map((log, i) => {
              const isBlocked = log.result === 'BLOCKED';
              const isAllowed = log.result === 'ALLOWED' || log.result === 'APPROVED';
              const isPending = log.result === 'PENDING' || log.result === 'APPROVAL_CREATED';

              return (
                <div key={log.id || i} className="relative group">
                  {/* Timeline Dot */}
                  <span
                    className={`absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ring-2 ${
                      isBlocked
                        ? 'bg-[#DC2626] ring-red-100'
                        : isAllowed
                        ? 'bg-[#16A34A] ring-emerald-100'
                        : 'bg-[#D97706] ring-amber-100'
                    }`}
                  ></span>

                  <div className="bg-[#F7F8FC] p-4 rounded-xl border border-[#E6E8F0] space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-[#171923]">{log.action}</span>
                        {isAllowed && (
                          <span className="badge-allowed text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✓ {log.result}
                          </span>
                        )}
                        {isBlocked && (
                          <span className="badge-blocked text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✕ {log.result}
                          </span>
                        )}
                        {isPending && (
                          <span className="badge-approval text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ⚠ {log.result}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-[#667085]">
                        {new Date(log.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-[#171923] font-medium leading-relaxed">
                      {log.reason || 'Agent request evaluated by PaySentinel Agent Shield.'}
                    </p>

                    {log.metadata && (
                      <div className="text-[11px] font-mono text-[#7D53F6] pt-1">
                        Enforced Rule: {log.metadata}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
