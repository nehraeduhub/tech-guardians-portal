import { Navigate, useParams } from 'react-router-dom';

// Old /course/:id and /courses/<id>.html links now open the Training Program page.
const CourseDetail = () => {
  const { id = '' } = useParams();
  return <Navigate to={`/training/${id.replace(/\.html$/i, '')}`} replace />;
};

export default CourseDetail;
