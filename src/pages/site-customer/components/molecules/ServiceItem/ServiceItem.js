import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarSide, faComment, faCircleNotch, faCreditCard } from '@fortawesome/free-solid-svg-icons';

const ServiceItem = ({ icon, text }) => {
    return (
        <li className='service d-flex p-4 border-end border-start '>
            <FontAwesomeIcon icon={icon} className='fs-3 me-2' />
            <div className='text'>
                <p className='fs-5 fw-semibold'>{text}</p>
            </div>
        </li>
    );
}

export default ServiceItem;
