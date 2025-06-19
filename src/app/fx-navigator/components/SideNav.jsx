import Image from 'next/image';
import Link from 'next/link';
import logo from '../../../../public/fx/images/logo.png';
import trend from '../../../../public/fx/images/trending.png';
import set from '../../../../public/fx/images/settings.png';
import User from '../../access-manager/components/User';
import { useRouter } from 'next/navigation';

export default function SideNav() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push('/dashboard'); 
  };
  //compo gvghvtft
  return (
    <div className="w-1/4 min-h-screen font-poppins  px-4 pt-8 bg-blue-600 text-white flex flex-col">
      <div className="flex justify-start mb-16">
        <Image src={logo} alt="Logo" width={35} height={24}         
         onClick={handleLogoClick}
        />
        <div className="font-semibold text-xl mt-1  ml-3">FX Navigator</div>
      </div>

      <div className="relative group ">
        <Link href="/">
          <button className="flex items-center pl-4 pr-4 py-2 mt-2 rounded-lg group hover:bg-[#F3F5F8] focus:bg-gray-200  ease-in-out">
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-4 stroke-white group-hover:stroke-blue-600 "
              strokeWidth="2"
            >
              <path
                d="M1.33301 2.16927C1.33301 1.94826 1.42081 1.7363 1.57709 1.58002C1.73337 1.42374 1.94533 1.33594 2.16634 1.33594H5.49967C5.72069 1.33594 5.93265 1.42374 6.08893 1.58002C6.24521 1.7363 6.33301 1.94826 6.33301 2.16927V6.33594C6.33301 6.55695 6.24521 6.76891 6.08893 6.92519C5.93265 7.08147 5.72069 7.16927 5.49967 7.16927H2.16634C1.94533 7.16927 1.73337 7.08147 1.57709 6.92519C1.42081 6.76891 1.33301 6.55695 1.33301 6.33594V2.16927ZM9.66634 2.16927C9.66634 1.94826 9.75414 1.7363 9.91042 1.58002C10.0667 1.42374 10.2787 1.33594 10.4997 1.33594H13.833C14.054 1.33594 14.266 1.42374 14.4223 1.58002C14.5785 1.7363 14.6663 1.94826 14.6663 2.16927V3.83594C14.6663 4.05695 14.5785 4.26891 14.4223 4.42519C14.266 4.58147 14.054 4.66927 13.833 4.66927H10.4997C10.2787 4.66927 10.0667 4.58147 9.91042 4.42519C9.75414 4.26891 9.66634 4.05695 9.66634 3.83594V2.16927ZM1.33301 11.3359C1.33301 11.1149 1.42081 10.903 1.57709 10.7467C1.73337 10.5904 1.94533 10.5026 2.16634 10.5026H5.49967C5.72069 10.5026 5.93265 10.5904 6.08893 10.7467C6.24521 10.903 6.33301 11.1149 6.33301 11.3359V13.8359C6.33301 14.057 6.24521 14.2689 6.08893 14.4252C5.93265 14.5815 5.72069 14.6693 5.49967 14.6693H2.16634C1.94533 14.6693 1.73337 14.5815 1.57709 14.4252C1.42081 14.2689 1.33301 14.057 1.33301 13.8359V11.3359ZM9.66634 8.83594C9.66634 8.61492 9.75414 8.40296 9.91042 8.24668C10.0667 8.0904 10.2787 8.0026 10.4997 8.0026H13.833C14.054 8.0026 14.266 8.0904 14.4223 8.24668C14.5785 8.40296 14.6663 8.61492 14.6663 8.83594V13.8359C14.6663 14.057 14.5785 14.2689 14.4223 14.4252C14.266 14.5815 14.054 14.6693 13.833 14.6693H10.4997C10.2787 14.6693 10.0667 14.5815 9.91042 14.4252C9.75414 14.2689 9.66634 14.057 9.66634 13.8359V8.83594Z"
                stroke="currentColor"
                strokeWidth="2"
                className="group-hover:stroke-blue-600"
              />
            </svg>
            <span className="text-lg font-medium hover:text-blue-600">
              Dashboard
            </span>
          </button>
        </Link>
        <Link href="/">
          <button className="flex items-center pl-4 pr-4 py-2 mt-2 rounded-lg group hover:bg-[#F3F5F8] focus:bg-gray-200 transition duration-300 ease-in-out">
            <svg
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-4 stroke-white group-hover:stroke-blue-600 "
              strokeWidth="2"
            >
              <path
                d="M1.33301 2.16927C1.33301 1.94826 1.42081 1.7363 1.57709 1.58002C1.73337 1.42374 1.94533 1.33594 2.16634 1.33594H5.49967C5.72069 1.33594 5.93265 1.42374 6.08893 1.58002C6.24521 1.7363 6.33301 1.94826 6.33301 2.16927V6.33594C6.33301 6.55695 6.24521 6.76891 6.08893 6.92519C5.93265 7.08147 5.72069 7.16927 5.49967 7.16927H2.16634C1.94533 7.16927 1.73337 7.08147 1.57709 6.92519C1.42081 6.76891 1.33301 6.55695 1.33301 6.33594V2.16927ZM9.66634 2.16927C9.66634 1.94826 9.75414 1.7363 9.91042 1.58002C10.0667 1.42374 10.2787 1.33594 10.4997 1.33594H13.833C14.054 1.33594 14.266 1.42374 14.4223 1.58002C14.5785 1.7363 14.6663 1.94826 14.6663 2.16927V3.83594C14.6663 4.05695 14.5785 4.26891 14.4223 4.42519C14.266 4.58147 14.054 4.66927 13.833 4.66927H10.4997C10.2787 4.66927 10.0667 4.58147 9.91042 4.42519C9.75414 4.26891 9.66634 4.05695 9.66634 3.83594V2.16927ZM1.33301 11.3359C1.33301 11.1149 1.42081 10.903 1.57709 10.7467C1.73337 10.5904 1.94533 10.5026 2.16634 10.5026H5.49967C5.72069 10.5026 5.93265 10.5904 6.08893 10.7467C6.24521 10.903 6.33301 11.1149 6.33301 11.3359V13.8359C6.33301 14.057 6.24521 14.2689 6.08893 14.4252C5.93265 14.5815 5.72069 14.6693 5.49967 14.6693H2.16634C1.94533 14.6693 1.73337 14.5815 1.57709 14.4252C1.42081 14.2689 1.33301 14.057 1.33301 13.8359V11.3359ZM9.66634 8.83594C9.66634 8.61492 9.75414 8.40296 9.91042 8.24668C10.0667 8.0904 10.2787 8.0026 10.4997 8.0026H13.833C14.054 8.0026 14.266 8.0904 14.4223 8.24668C14.5785 8.40296 14.6663 8.61492 14.6663 8.83594V13.8359C14.6663 14.057 14.5785 14.2689 14.4223 14.4252C14.266 14.5815 14.054 14.6693 13.833 14.6693H10.4997C10.2787 14.6693 10.0667 14.5815 9.91042 14.4252C9.75414 14.2689 9.66634 14.057 9.66634 13.8359V8.83594Z"
                stroke="currentColor"
                strokeWidth="2"
                className="group-hover:stroke-blue-600"
              />
            </svg>
            <span className="text-lg font-medium hover:text-blue-600">
              Rate Manager
            </span>
          </button>
        </Link>
        <Link href="/">
          <button className="flex items-center pl-4 pr-5 py-2 rounded-lg mt-2 group hover:bg-[#F3F5F8]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-4 stroke-current group-hover:stroke-blue-600"
              strokeWidth="2"
            >
              <path
                d="M21 11.5C21 16.1944 16.9706 20 12 20C10.4022 20 8.88867 19.6317 7.55847 18.9813L3 20L4.63566 16.681C3.6218 15.4997 3 13.9995 3 12.5C3 7.80558 7.02944 4 12 4C16.9706 4 21 7.80558 21 11.5Z"
                stroke="white"
                className="group-hover:stroke-blue-600"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="11"
                r="0.7"
                fill="white"
                className="group-hover:fill-blue-600"
              />
              <circle
                cx="12"
                cy="11"
                r="0.7"
                fill="white"
                className="group-hover:fill-blue-600"
              />
              <circle
                cx="15"
                cy="11"
                r="0.7"
                fill="white"
                className="group-hover:fill-blue-600"
              />
            </svg>
            <span className="text-lg font-medium group-hover:text-blue-600 ">
              All Messages
            </span>
          </button>
        </Link>

        <Link href="/">
          <button className="flex items-center pl-4 pr-12 py-2 mt-2 rounded-lg border border-transparent text-white transition duration-300 ease-in-out hover:bg-[#F3F5F8] hover:border-blue-600 hover:text-blue-600">
            {/* SVG Trends Icon with X and Y Axes */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-4 transition duration-300 ease-in-out"
            >
              {/* X and Y Axes - X at the bottom, Y at the left */}
              <path
                d="M4 4V20H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Trend Line */}
              <path
                d="M6 18L10 12L14 16L20 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Arrow at End */}
              <path
                d="M20 12V10H18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Trends Text */}
            <span className="text-lg font-medium transition duration-300 ease-in-out">
              Trends
            </span>
          </button>
        </Link>
        <Link href="/">
          <button className="flex items-center pl-4 pr-12 py-2 mt-2 rounded-lg border border-transparent text-white transition duration-300 ease-in-out hover:bg-[#F3F5F8] hover:border-blue-600 hover:text-blue-600">
            {/* SVG Reports Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 16 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-4 transition duration-300 ease-in-out"
            >
              <path
                d="M7.45375 0.929688H1.125V14.5672H12.375V5.70344M7.45375 0.929688L12.375 5.70344M7.45375 0.929688V5.70344H12.375M3.625 17.1234H14.875V8.37344M3 8.37344H10.5M3 5.24844H5.5M3 11.4984H10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            {/* Reports Text */}
            <span className="text-lg font-medium transition duration-300 ease-in-out">
              Reports
            </span>
          </button>
        </Link>
        <Link href="/">
          <button className="flex items-center pl-4 pr-12 py-2 mt-2 rounded-lg  border-white text-white transition duration-300   ease-in-out hover:bg-white hover:border-blue-600 hover:text-blue-600">
            {/* SVG Settings Icon */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-4 transition duration-300 ease-in-out"
            >
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="M4.93 4.93l1.41 1.41"></path>
              <path d="M17.66 17.66l1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="M6.34 17.66l-1.41 1.41"></path>
              <path d="M19.07 4.93l-1.41 1.41"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>

            {/* Settings Text */}
            <span className="text-lg font-medium transition duration-300 ease-in-out">
              Settings
            </span>
          </button>
        </Link>
      </div>
      {/* Bottom Section */}
      <div className="mt-auto mb-4">
        <User />
      </div>
    </div>
  );
}
