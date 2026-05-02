"use client";

type StorageManagementPanelProps = {
  onClearData: () => void;
  onExportData: () => void;
  onLoadDemoAcademic: () => void;
  onLoadDemoVenture: () => void;
};

export function StorageManagementPanel({
  onClearData,
  onExportData,
  onLoadDemoAcademic,
  onLoadDemoVenture
}: StorageManagementPanelProps) {
  return (
    <section className="panel storagePanel">
      <div>
        <h2>本地数据</h2>
        <p className="muted">导出、清空，或加载展示用 Demo 数据。</p>
      </div>
      <div className="storageActions">
        <button className="secondaryButton" type="button" onClick={onLoadDemoAcademic}>
          学业 Demo
        </button>
        <button className="secondaryButton" type="button" onClick={onLoadDemoVenture}>
          项目 Demo
        </button>
        <button type="button" onClick={onExportData}>
          导出 JSON
        </button>
        <button className="secondaryButton" type="button" onClick={onClearData}>
          清空数据
        </button>
      </div>
    </section>
  );
}
