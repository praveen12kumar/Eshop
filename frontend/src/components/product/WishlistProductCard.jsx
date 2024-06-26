import React from "react";
import { Link } from "react-router-dom";
import {
  deleteWishlistItem,
  getWishlistItem,
  setLoadingWishlist,
} from "../../features/wishlist/wishlistSlice";
import { useDispatch } from "react-redux";
import { AiFillStar } from "react-icons/ai";
import { FaHeart } from "react-icons/fa";

const WishlistProductCard = ({ data }) => {
  const dispatch = useDispatch();

  const handleLiked = () => {
    dispatch(setLoadingWishlist());
    dispatch(deleteWishlistItem(data._id));
    dispatch(getWishlistItem());
  };

  return (
    <div className="w-44 h-[300px] md:w-48 md:h-[350px]  bg-white shadow-xl flex flex-col gap-2 rounded-md hover:-translate-y-3 transition-all duration-300 ease-in">
      <div className="flex flex-row items-start object-cover p-2 relative">
        <img
          className="w-[200px] h-[150px] md:h-[170px] lg:h-[200px] object-contain hover:scale-105 transition-all duration-300 ease-in"
          src={data?.images[0]?.url}
          alt="product"
        />
        <div
          className="absolute top-3 right-3 cursor-pointer text-xl md:text-2xl flex items-center"
          onClick={handleLiked}
        >
          <FaHeart className="text-cyan-700" />
        </div>
      </div>
      <div className="mt-4 p-3">
        <div className="flex justify-between text-sm md:text-base capitalize mb-2 text-text-black">
          <Link
            to={`/product/${data?._id}`}
            className="cursor-pointer line-clamp-1"
          >
            {data?.name}
          </Link>
        </div>
        <div className="flex mb-2 gap-1 items-center">
          <div className="bg-green-600 text-xs md:text-sm rounded-sm p-1 text-white font-semibold flex items-center gap-1">
            <span>{data?.ratings?.toFixed(1)}</span>
            <AiFillStar className="text-xs md:text-sm" />
          </div>
          <p className="text-xs md:text-sm">
            ({data?.numberOfReviews} Reviews)
          </p>
        </div>
        <div className="text-sm text-text-black flex gap-2">
          <span className="font-semibold whitespace-nowrap">
            ₹{data?.price}
          </span>
          <span className="line-through whitespace-nowrap">
            ₹{data?.originalPrice}
          </span>
          <span className="text-green-600 whitespace-nowrap">
            {data?.discount}% off
          </span>
        </div>
      </div>
    </div>
  );
};

export default WishlistProductCard;
