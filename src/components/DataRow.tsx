const DataRow = (param: { label: string; data: any }) => {
  const { label, data } = param;
  return (
    <div className="retro-detail-row">
      <span className="text-white">{label}:</span>
      <span className="text-white font-light">{data}</span>
    </div>
  );
};

export default DataRow;
